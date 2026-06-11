<#
=========================================================
Zenith HealthTech - Microsoft Entra ID Setup
=========================================================

This script:

1. Connects to Azure
2. Connects to Microsoft Graph
3. Locates the Azure Key Vault and Web App
4. Checks whether the App Registration already exists
5. Creates:
      - App Registration
      - Enterprise Application
      - ADMIN role
      - DOCTOR role
      - NURSE role
      - Client Secret
      - NEXTAUTH_SECRET
6. Stores secrets in Azure Key Vault

Run:

.\setup-entra.ps1

or

.\setup-entra.ps1 `
    -ResourceGroup rg-ZenithHealth `
    -AppName zht-dashboard `
    -DisplayName "Zenith Health Portal"

=========================================================
#>

param(
    [string]$ResourceGroup = "rg-ZenithHealth",
    [string]$AppName = "zht-dashboard",
    [string]$DisplayName = "Zenith Health Portal"
)

Write-Host ""
Write-Host "====================================="
Write-Host " Zenith Health Entra Setup"
Write-Host "====================================="
Write-Host ""

##########################################################
# Login Azure
##########################################################
Write-Host "Step 1: Sign in to Azure (used for Key Vault access)..."
Connect-AzAccount

##########################################################
# Login Microsoft Graph
##########################################################

Write-Host "Step 2: Sign in to Microsoft Graph (used to create Entra resources)..."
Write-Host ""
Write-Host "Connecting to Microsoft Graph..."

Connect-MgGraph `
    -Scopes `
        "Application.ReadWrite.All",
        "Directory.ReadWrite.All",
        "AppRoleAssignment.ReadWrite.All"

Write-Host "Connected to Microsoft Graph."
Write-Host ""
$tenantId = (Get-MgContext).TenantId

##########################################################
# Locate Key Vault
##########################################################

Write-Host ""
Write-Host "Locating Key Vault..."

$keyVault = Get-AzKeyVault `
    -ResourceGroupName $ResourceGroup |
    Select-Object -First 1

if (-not $keyVault) {

    throw "No Key Vault found in resource group $ResourceGroup"
}

$KeyVaultName = $keyVault.VaultName

Write-Host "Key Vault:"
Write-Host $KeyVaultName
Write-Host ""

##########################################################
# Locate Web App
##########################################################

Write-Host ""
Write-Host "Locating Web App..."
$webApp = Get-AzWebApp `
    -ResourceGroupName $ResourceGroup `
    -Name $AppName

if (-not $webApp) {
    throw "Web App not found."
}

Write-Host "Web App:"
Write-Host $webApp.Name
Write-Host ""

##########################################################
# Check for existing application
##########################################################

Write-Host "Checking for existing App Registration..."

$existing = Get-MgApplication -All |
    Where-Object {
        $_.DisplayName -eq $DisplayName
    } |
    Select-Object -First 1

if ($existing) {

    Write-Host ""
    Write-Host "App Registration already exists."
    Write-Host ""

    $app = $existing

    Write-Host "Display Name : $DisplayName"
    Write-Host "Client ID    : $($app.AppId)"

    Write-Host ""
    Write-Host "Locating Enterprise Application..."

    $sp = Get-MgServicePrincipal -Filter "appId eq '$($app.AppId)'" |
        Select-Object -First 1

    if (-not $sp) {
        throw "Enterprise Application not found."
    }

    $clientSecret = $null
}
else {
    Write-Host ""
    Write-Host "No existing App Registration found. Proceeding to create new one..."


    ##########################################################
    # Create Role GUIDs
    ##########################################################

    $adminRoleId  = [Guid]::NewGuid()

    $doctorRoleId = [Guid]::NewGuid()

    $nurseRoleId  = [Guid]::NewGuid()

    ##########################################################
    # Redirect URIs
    ##########################################################

    $redirectUris = @(
        "http://localhost:3000/api/auth/callback/azure-ad",
        "https://$AppName.azurewebsites.net/api/auth/callback/azure-ad"
    )

    ##########################################################
    # Build App Roles
    ##########################################################

    $appRoles = @(
        @{
            AllowedMemberTypes = @("User")
            DisplayName = "ADMIN"
            Description = "Administrator"
            Id = $adminRoleId
            IsEnabled = $true
            Value = "ADMIN"
        },

        @{
            AllowedMemberTypes = @("User")
            DisplayName = "DOCTOR"
            Description = "Doctor"
            Id = $doctorRoleId
            IsEnabled = $true
            Value = "DOCTOR"
        },

        @{
            AllowedMemberTypes = @("User")
            DisplayName = "NURSE"
            Description = "Nurse"
            Id = $nurseRoleId
            IsEnabled = $true
            Value = "NURSE"
        }
    )

    ##########################################################
    # Create App Registration
    ##########################################################

    Write-Host ""
    Write-Host "Creating App Registration..."

    $app = New-MgApplication `
        -DisplayName $DisplayName `
        -Web @{
            RedirectUris = $redirectUris
        } `
        -AppRoles $appRoles

    if (-not $app) {
        throw "Failed to create App Registration."
    }

    Write-Host "Created."

    ##########################################################
    # Create Enterprise Application
    ##########################################################

    Write-Host ""
    Write-Host "Creating Enterprise Application..."

    $sp = New-MgServicePrincipal `
        -AppId $app.AppId

    if (-not $sp) {
        throw "Failed to create Enterprise Application."
    }

    Write-Host "Created."

    ##########################################################
    # Create Client Secret
    ##########################################################

    Write-Host ""
    Write-Host "Creating Client Secret..."

    $password = Add-MgApplicationPassword `
        -ApplicationId $app.Id

    $clientSecret = $password.SecretText

    if (-not $clientSecret) {
        throw "Failed to create client secret."
    }

    ##########################################################
    # Generate NEXTAUTH_SECRET
    ##########################################################

    $nextAuthSecret = [Convert]::ToBase64String(
        [System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
    )

    ##########################################################
    # Save to Key Vault
    ##########################################################

    Write-Host ""
    Write-Host "Saving secrets to Key Vault..."

    Set-AzKeyVaultSecret `
        -VaultName $KeyVaultName `
        -Name "aad-client-id" `
        -SecretValue (
            ConvertTo-SecureString `
                $app.AppId `
                -AsPlainText `
                -Force
        )

    Set-AzKeyVaultSecret `
        -VaultName $KeyVaultName `
        -Name "aad-client-secret" `
        -SecretValue (
            ConvertTo-SecureString `
                $clientSecret `
                -AsPlainText `
                -Force
        )

    Set-AzKeyVaultSecret `
        -VaultName $KeyVaultName `
        -Name "nextauth-secret" `
        -SecretValue (
            ConvertTo-SecureString `
                $nextAuthSecret `
                -AsPlainText `
                -Force
        )

    Set-AzKeyVaultSecret `
        -VaultName $KeyVaultName `
        -Name "aad-tenant-id" `
        -SecretValue (
            ConvertTo-SecureString `
                $tenantId `
                -AsPlainText `
                -Force
        )

    Set-AzKeyVaultSecret `
        -VaultName $KeyVaultName `
        -Name "enterprise-app-object-id" `
        -SecretValue (
            ConvertTo-SecureString `
                $sp.Id `
                -AsPlainText `
                -Force
        )
}

##########################################################
# Web App Settings
##########################################################
Write-Host ""
Write-Host "Configuring Web App settings..."

$appSettings = @{}
foreach ($setting in $webApp.SiteConfig.AppSettings) {
    $appSettings[$setting.Name] = $setting.Value
}
$appSettings["AZURE_AD_CLIENT_ID"] =
    "@Microsoft.KeyVault(SecretUri=https://$KeyVaultName.vault.azure.net/secrets/aad-client-id)"
$appSettings["AZURE_AD_CLIENT_SECRET"] =
    "@Microsoft.KeyVault(SecretUri=https://$KeyVaultName.vault.azure.net/secrets/aad-client-secret)"
$appSettings["AZURE_AD_TENANT_ID"] =
    "@Microsoft.KeyVault(SecretUri=https://$KeyVaultName.vault.azure.net/secrets/aad-tenant-id)"
$appSettings["NEXTAUTH_SECRET"] =
    "@Microsoft.KeyVault(SecretUri=https://$KeyVaultName.vault.azure.net/secrets/nextauth-secret)"
$appSettings["NEXTAUTH_URL"] = "https://$AppName.azurewebsites.net"

Set-AzWebApp `
    -ResourceGroupName $ResourceGroup `
    -Name $AppName `
    -AppSettings $appSettings | Out-Null

Write-Host "Web App settings updated."

##########################################################
# Summary
##########################################################

Write-Host ""
Write-Host "====================================="
Write-Host "Setup Complete"
Write-Host "====================================="
Write-Host ""

Write-Host "Display Name:"
Write-Host $DisplayName

Write-Host ""

Write-Host "Client ID:"
Write-Host $app.AppId

Write-Host ""

Write-Host "Enterprise Application Object ID:"
Write-Host $sp.Id

Write-Host ""

Write-Host "Stored in Key Vault:"
Write-Host "  aad-client-id"
Write-Host "  aad-client-secret"
Write-Host "  aad-tenant-id"
Write-Host "  nextauth-secret"
Write-Host "  enterprise-app-object-id"

Write-Host ""

Write-Host "Next Step:"
Write-Host "Assign users to ADMIN / DOCTOR / NURSE roles with"
Write-Host "./bootstrap-users.ps1 script."