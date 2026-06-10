provider "azuread" {}


resource "azuread_application" "zenith_portal" {
  display_name = "Zenith Health Portal"
  owners = [data.azurerm_client_config.current.object_id]

  app_role {
    allowed_member_types  = ["User"]
    description           = "Admin role for Zenith Health Portal"
    display_name         = "ADMIN"
    value                = "ADMIN"
    id                   = uuid()
  }
    app_role {
        allowed_member_types  = ["User"]
        description           = "Doctors role for Zenith Health Portal"
        display_name         = "DOCTOR"
        value                = "DOCTOR"
        id                   = uuid()
    }
    app_role {
        allowed_member_types  = ["User"]
        description           = "Nurses role for Zenith Health Portal"
        display_name         = "NURSE"
        value                = "NURSE"
        id                   = uuid()
    }
    web {
        redirect_uris = [
            "https://localhost:3000/auth/callback",
            "https://${azurerm_linux_web_app.portal_app.default_site_hostname}/auth/callback"
        ]
    
    }
}

resource "azuread_service_principal" "zenith_portal_sp" {
  client_id = azuread_application.zenith_portal.client_id
}

resource "azuread_application_password" "portal_password" {
    application_id = azuread_application.zenith_portal.id
}

resource "azurerm_key_vault_secret" "aad_client_id" {
  name         = "aad-client-id"
  value        = azuread_application.zenith_portal.client_id
  key_vault_id = azurerm_key_vault.kv.id
}

resource "azurerm_key_vault_secret" "aad_client_secret" {
  name         = "aad-client-secret"
    value        = azuread_application_password.portal_password.value
    key_vault_id = azurerm_key_vault.kv.id
}