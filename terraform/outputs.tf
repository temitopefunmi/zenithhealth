output "webapp_url" {
  value = "https://${azurerm_linux_web_app.web_app.default_hostname}"
}

output "scheduler_function_name" {
  value = azurerm_linux_function_app.scheduler_function.name
}

output "scheduler_function_url" {
  value = "https://${azurerm_linux_function_app.scheduler_function.default_hostname}"
}