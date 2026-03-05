# Define the Resource Group
resource "azurerm_resource_group" "rg" {
  name = var.resource_group_name
  location = var.location

  tags = {
    environment = "production"
    project     = "zenith-health"
  }
}


# Create a Storage Account
resource "azurerm_storage_account" "storage" {
  name                     = "zenithhealthstorage"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"  
    tags = {
        environment = "production"
        project     = "zenith-health"
    }
}

# Create an App Service Plan
resource "azurerm_app_service_plan" "app_service_plan" {
  name                = "zenith-health-app-service-plan"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  kind                = "Linux"
  reserved            = true
  sku {
    tier = "Basic"
    size = "B1"
  }
  tags = {
    environment = "production"
    project     = "zenith-health"
  }
}   

# Create the Linux Web App
resource "azurerm_linux_web_app" "web_app" {
  name                = "zenith-health-web-app"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id = azurerm_app_service_plan.app_service_plan.id

  site_config {
    always_on = false # Set to true for production tiers (P1v2+)
  

    application_stack {
        node_version = "22-lts"
    }
  }
  app_settings = {
    "NODE_ENV" = "production"
  }

}