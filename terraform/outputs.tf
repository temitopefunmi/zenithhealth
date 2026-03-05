output "webapp_url" {
  value = "http://${azurerm_linux_web_app.webapp.default_site_hostname}"
}   