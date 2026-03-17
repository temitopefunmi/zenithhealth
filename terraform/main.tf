


# 0. Helper for unique naming
resource "random_id" "server_suffix" {
  byte_length = 4
}

# 1. Get details about the current logged-in identity (The GitHub Runner)
data "azurerm_client_config" "current" {}

# 2. Resource Group
resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}

# 3. Azure Key Vault
resource "azurerm_key_vault" "kv" {
  name                        = "kv-zh-${random_id.server_suffix.hex}"
  location                    = azurerm_resource_group.rg.location
  resource_group_name         = azurerm_resource_group.rg.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false

  sku_name = "standard"

  # Access policy so YOU (via Terraform) can manage secrets
  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = [
      "Get", "List", "Set", "Delete", "Purge", "Recover"
    ]
  }
}

# 4. Generate Random Password
resource "random_password" "sql_admin_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# 5. Store Password in Key Vault
resource "azurerm_key_vault_secret" "sql_password_secret" {
  name         = "sql-admin-password"
  value        = random_password.sql_admin_password.result
  key_vault_id = azurerm_key_vault.kv.id
}

# 6. Modern SQL Server
resource "azurerm_mssql_server" "sql_server" {
  name                         = lower(replace("sql-${var.app_name}", "_", "-"))
  resource_group_name          = azurerm_resource_group.rg.name
  location                     = azurerm_resource_group.rg.location
  version                      = "12.0"
  administrator_login          = "sqladminuser"
  administrator_login_password = azurerm_key_vault_secret.sql_password_secret.value
}

# 7. Modern SQL Database (Serverless)
resource "azurerm_mssql_database" "sql_database" {
  name         = "db-${var.app_name}"
  server_id    = azurerm_mssql_server.sql_server.id
  collation    = "SQL_Latin1_General_CP1_CI_AS"
  sku_name     = "GP_S_Gen5_1" 
  
  auto_pause_delay_in_minutes = 60 
  min_capacity                = 0.5
}

# 8. Firewall Rule
resource "azurerm_mssql_firewall_rule" "allow_azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.sql_server.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# 9. Service Plan
resource "azurerm_service_plan" "asp" {
  name                = "asp-${var.app_name}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "F1"
}

# 10. Web App
resource "azurerm_linux_web_app" "web_app" {
  name                = var.app_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.asp.id

  identity {
    type = "SystemAssigned"
  }

  site_config {
    app_command_line = "node server.js"
    application_stack {
      node_version = "22-lts"
    }
  }

  app_settings = {
    "WEBSITE_PORT"             = "8080"
    "NODE_ENV"                 = "production"
    "WEBSITE_RUN_FROM_PACKAGE" = "1"
    
    # 🔐 Secure Key Vault References
    # Using 'versionless_id' ensures Azure always pulls the latest password 
    # even if you rotate it later.
    "DB_PASSWORD"  = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.sql_password_secret.versionless_id})"
    
    # The Full Connection String
    # DB_PASSWORD reference inside the connection string
    "DATABASE_URL" = "Server=tcp:${azurerm_mssql_server.sql_server.fully_qualified_domain_name},1433;Initial Catalog=${azurerm_mssql_database.sql_database.name};User ID=${azurerm_mssql_server.sql_server.administrator_login};Password=@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.sql_password_secret.versionless_id});Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }
  # Prevent Terraform from flapping on minor Node version differences
  lifecycle {
    ignore_changes = [
      site_config[0].application_stack[0].node_version
    ]
  }
}

# 11. Create access policy for the Web App's Managed Identity to read secrets from Key Vault
resource "azurerm_key_vault_access_policy" "web_app_access" {
  key_vault_id = azurerm_key_vault.kv.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_linux_web_app.web_app.identity[0].principal_id
  secret_permissions = [
    "Get", "List"
  ]
}