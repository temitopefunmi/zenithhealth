output "webapp_url" {
  value = "https://${azurerm_linux_web_app.web_app.default_hostname}"
}