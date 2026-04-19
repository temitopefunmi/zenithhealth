


# 0. Helper for unique naming
resource "random_id" "server_suffix" {
  byte_length = 4
}

# 1. Get details about the current logged-in identity (The GitHub Runner)
data "azurerm_client_config" "current" {}

# 2. Resource Group Config
resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}

# 3. Azure Key Vault for storing secrets securely (SQL password, OpenAI key)
resource "azurerm_key_vault" "kv" {
  name                        = "kv-zh-${random_id.server_suffix.hex}"
  location                    = azurerm_resource_group.rg.location
  resource_group_name         = azurerm_resource_group.rg.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false

  sku_name = "standard"

  # Access policy so Terraform can manage secrets
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
  lifecycle {
    ignore_changes = all
  }
}

# 5. Store Password in Key Vault
resource "azurerm_key_vault_secret" "sql_password_secret" {
  name         = "sql-admin-password"
  value        = random_password.sql_admin_password.result
  key_vault_id = azurerm_key_vault.kv.id
  lifecycle {
    ignore_changes = [ value ]
  }
}

# 6. Modern SQL Server
resource "azurerm_mssql_server" "sql_server" {
  name                         = lower(replace("sql-${var.app_name}", "_", "-"))
  resource_group_name          = azurerm_resource_group.rg.name
  location                     = azurerm_resource_group.rg.location
  version                      = "12.0"
  administrator_login          = var.sql_admin_username
  administrator_login_password = azurerm_key_vault_secret.sql_password_secret.value
}

# 7. Modern SQL Database (Serverless)
resource "azurerm_resource_group_template_deployment" "sql_database" {
  name               = "sql-database-deployment"
  resource_group_name = azurerm_resource_group.rg.name
  deployment_mode     = "Incremental"
  # This file was created by the "az bicep build" step in GitHub Actions
  template_content    = file("${path.module}/sql_db.json")
  parameters_content = jsonencode({
    databaseName = { value: "db-${var.app_name}" }
    serverName   = { value: azurerm_mssql_server.sql_server.name }
    location     = { value: azurerm_resource_group.rg.location }
  })
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

# 10. Azure OpenAI Service Creation
resource "azurerm_cognitive_account" "openai" {
  name                = "cog-zh-${random_id.server_suffix.hex}"
  location            = "eastus" # Ensure OpenAI is available in your region
  resource_group_name = azurerm_resource_group.rg.name
  kind                = "OpenAI"
  sku_name            = "S0"
  
  # Required for Managed Identity access to Cognitive Services
  custom_subdomain_name = "zenith-ai-${random_id.server_suffix.hex}"
}

# 11. OpenAI Model Deployment 
resource "azurerm_cognitive_deployment" "ai-scheduler" {
  name                 = "ai-scheduler"
  cognitive_account_id = azurerm_cognitive_account.openai.id
  model {
    format  = "OpenAI"
    name    = "gpt-4.1-mini"
    version = "2025-04-14"
  }
  sku {
    name = "Standard"
  }
}

# 12. Store AI Key in Key Vault
resource "azurerm_key_vault_secret" "openai_key" {
  name         = "azure-openai-key"
  value        = azurerm_cognitive_account.openai.primary_access_key
  key_vault_id = azurerm_key_vault.kv.id
}

# 13. Web App (Modified to include AI settings)
resource "azurerm_linux_web_app" "web_app" {
  depends_on          = [ azurerm_application_insights.app_insights ]
  name                = var.app_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.asp.id
  https_only          = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on = false
    app_command_line = "node server.js"
    minimum_tls_version = "1.2"
    application_stack {
      node_version = "22-lts"
    }
  }

  app_settings = {
    "WEBSITE_PORT"             = "8080"
    "NODE_ENV"                 = "production"
    
    # SQL Settings
    "DB_SERVER"    = azurerm_mssql_server.sql_server.fully_qualified_domain_name
    "DB_NAME"      = "db-${var.app_name}"
    "DB_USER"      = azurerm_mssql_server.sql_server.administrator_login
    "DB_PASSWORD"  = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.sql_password_secret.versionless_id})"

    # AZURE AI SETTINGS
    "AZURE_OPENAI_ENDPOINT"        = azurerm_cognitive_account.openai.endpoint
    "AZURE_OPENAI_DEPLOYMENT_NAME" = azurerm_cognitive_deployment.ai-scheduler.name
    # Secure Key Vault Reference for AI Key
    "AZURE_OPENAI_API_KEY"         = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.openai_key.versionless_id})"

    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.app_insights.connection_string
  }
}

# 14. Fetch the Web App identity after creation
data "azurerm_linux_web_app" "web_app" {
  name                = azurerm_linux_web_app.web_app.name
  resource_group_name = azurerm_linux_web_app.web_app.resource_group_name
  depends_on         = [ azurerm_linux_web_app.web_app ]
}

# 15. Create access policy for the Web App's Managed Identity to read secrets from Key Vault
resource "azurerm_key_vault_access_policy" "web_app_access" {
  key_vault_id = azurerm_key_vault.kv.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = data.azurerm_linux_web_app.web_app.identity[0].principal_id
  secret_permissions = [
    "Get", "List"
  ]
  depends_on = [ azurerm_linux_web_app.web_app ]
}

# 16. The Workspace where logs are stored
resource "azurerm_log_analytics_workspace" "log_workspace" {
  name                = "log-${var.app_name}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "PerGB2018"
}

# 17. The Application Insights instance
resource "azurerm_application_insights" "app_insights" {
  name                = "ai-${var.app_name}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  application_type     = "Node.JS"
  workspace_id        = azurerm_log_analytics_workspace.log_workspace.id
}

