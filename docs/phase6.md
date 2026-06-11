# Phase 6: Identity and Access Management with Microsoft Entra ID

## Overview

In this phase, I implemented identity and access management for the Zenith Health Portal using Microsoft Entra ID and Azure Role-Based Access Control (RBAC).

The objective was to:

- Authenticate users securely with Microsoft Entra ID
- Implement application-level role-based access control (RBAC)
- Eliminate hardcoded secrets from the application
- Store sensitive values securely in Azure Key Vault
- Use managed identities for secure resource access
- Automate Entra ID provisioning with PowerShell

This phase marked the transition from a functional web application to one with enterprise-style identity management and authorization.

---

# Architecture

```
                    +----------------------+
                    | Microsoft Entra ID   |
                    +----------+-----------+
                               |
                               |
                    App Registration
                               |
                               |
                    Enterprise Application
                               |
             +-----------------+-----------------+
             |                 |                 |
           ADMIN            DOCTOR            NURSE
             |                 |                 |
             +-----------------+-----------------+
                               |
                               |
                        User Authentication
                               |
                               v

                     Zenith Health Portal
                               |
                          NextAuth.js
                               |
                               |
                     Azure Key Vault Secrets
                               |
                               |
                    User Assigned Managed Identity
```

---

# Migrating to a User Assigned Managed Identity

Initially, the application used a system-assigned managed identity.

During infrastructure updates, I encountered situations where the managed identity changed unexpectedly, causing access issues with Azure Key Vault.

To improve stability, I migrated the application to a user-assigned managed identity.

This provided:

- A persistent identity
- Stable Key Vault permissions
- Easier infrastructure management
- Better separation between application lifecycle and identity lifecycle

The managed identity is granted permission to retrieve secrets from Azure Key Vault without storing credentials inside the application.

---

# Microsoft Entra ID Authentication

Authentication is implemented using Microsoft Entra ID together with NextAuth.js.

A dedicated App Registration is created for the Zenith Health Portal.

The App Registration defines:

- Redirect URIs
- Client ID
- Client Secret
- Application roles

An Enterprise Application (Service Principal) is then automatically created from the App Registration and becomes the object that users are assigned to inside the tenant.

---

# Application Roles

Three application roles were defined:

- ADMIN
- DOCTOR
- NURSE

These roles are stored inside the App Registration and exposed through the Enterprise Application.

After authentication, the user's assigned role is included in the authentication token and used by the application to determine which pages and functionality should be accessible.

This allows the same application to present different experiences depending on the authenticated user's permissions.

---

# Secure Secret Management

Sensitive values are not committed to source control.

During setup, the following values are generated and stored in Azure Key Vault:

- aad-client-id
- aad-client-secret
- aad-tenant-id
- nextauth-secret

The Azure App Service references these secrets directly from Key Vault using Key Vault references in its application settings.

This eliminates hardcoded credentials from both the repository and deployment configuration.

---

# PowerShell Automation

To avoid repeatedly configuring Microsoft Entra ID through the Azure Portal, I created PowerShell automation scripts.

## setup-entra.ps1

This script:

- Connects to Azure
- Connects to Microsoft Graph
- Locates the Azure Key Vault
- Locates the Azure Web App
- Creates the App Registration
- Creates the Enterprise Application
- Creates the ADMIN role
- Creates the DOCTOR role
- Creates the NURSE role
- Generates a client secret
- Generates a NextAuth secret
- Stores secrets in Azure Key Vault
- Configures Azure App Service settings to use Key Vault references

The script is designed to automate the entire Entra setup process with minimal manual portal interaction.

---

## bootstrap-users.ps1

A second PowerShell script was created to simplify user provisioning.

Features include:

- Interactive menu
- Safe to rerun
- Existing user detection
- Automatic password generation
- Force password change on first sign-in
- Automatic application role assignment

Supported user types:

- Admin
- Doctor
- Nurse
- Custom

Custom users can optionally be assigned one of the predefined application roles.

---

# Challenges Encountered

During implementation, several practical challenges were encountered:

- Migrating from a system-assigned to a user-assigned managed identity
- Understanding the relationship between App Registrations and Enterprise Applications
- Learning Microsoft Graph authentication and permissions
- Automating Entra resource creation with PowerShell
- Configuring Azure App Service to consume secrets securely from Azure Key Vault
- Applying least-privilege Azure RBAC permissions while allowing automation scripts to update App Service configuration

Working through these challenges provided a much deeper understanding of Microsoft Entra ID beyond basic portal configuration.

---

# Conclusion

At the end of this phase:

- Microsoft Entra ID authentication is operational
- Users can successfully sign in to the application
- Application roles (ADMIN, DOCTOR, and NURSE) are enforced
- Secrets are securely stored in Azure Key Vault
- Azure App Service consumes secrets through Key Vault references
- A user-assigned managed identity is used for secure resource access
- Entra provisioning and user onboarding have been automated with reusable PowerShell scripts

This establishes the identity and authorization foundation for future development of the Zenith Health Portal.