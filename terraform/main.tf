# Define the Resource Group
resource "azurerm_resource_group" "rg" {
  name = var.resource_group_name
  location = var.location

  tags = {
    environment = "production"
    project     = "zenith-health"
  }
}

# Create an App Service Plan
resource "azurerm_service_plan" "app_service_plan" {
  name                = "asp-zenith-portal"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  
  # These are now required top-level arguments, not blocks
  os_type             = "Linux"
  sku_name            = "F1" 
}

resource "azurerm_linux_web_app" "web_app" {
  name                = var.app_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.app_service_plan.id

  site_config {
    # 1. AUTOMATED STARTUP COMMAND
    # This tells Azure exactly how to launch Next.js
    app_command_line = "npx next start -p 8080"
    application_stack {
      node_version = "22-lts"
    }
    always_on = false # Always On is not required for Free Tier, so we set it to false
  }
  app_settings = {
    "PORT" = "8080"
    "NODE_ENV" = "production"
  }

  lifecycle {
    ignore_changes = [
      site_config[0].application_stack[0].node_version
    ]
  }
}

