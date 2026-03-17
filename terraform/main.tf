resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    environment = "production"
    project     = "zenith-health"
  }
}

resource "azurerm_service_plan" "app_service_plan" {
  name                = "asp-${var.app_name}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  os_type  = "Linux"
  sku_name = "F1"

  tags = {
    environment = "production"
    project     = "zenith-health"
  }
}

resource "azurerm_linux_web_app" "web_app" {
  name                = var.app_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.app_service_plan.id

  site_config {
    app_command_line = "node server.js"

    application_stack {
      node_version = "22-lts"
    }

    always_on = false
  }

  app_settings = {
    WEBSITE_PORT             = "8080"
    NODE_ENV                 = "production"
    WEBSITE_RUN_FROM_PACKAGE = "1"
  }

  lifecycle {
    ignore_changes = [
      site_config[0].application_stack[0].node_version
    ]
  }

  tags = {
    environment = "production"
    project     = "zenith-health"
  }
}