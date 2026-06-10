<#
=========================================================
Zenith HealthTech - Microsoft Entra ID Setup
=========================================================

This script:

1. Connects to Azure
2. Connects to Microsoft Graph
3. Locates the Azure Key Vault
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

try {
    $ctx = Get-AzContext -ErrorAction Stop

    if (-not $ctx.Account) {
        throw
    }

    Write-Host "Already logged into Azure."
}
catch {

    Write-Host "Connecting to Azure..."

    Connect-AzAccount
}

##########################################################
# Login Microsoft Graph
##########################################################

try {

    $mg = Get-MgContext

    if (-not $mg) {
        throw
    }

    Write-Host "Already connected to Microsoft Graph."
}
catch {

    Write-Host "Connecting to Microsoft Graph..."

    Connect-MgGraph `
        -Scopes `
            "Application.ReadWrite.All",
            "Directory.ReadWrite.All",
            "AppRoleAssignment.ReadWrite.All"
}

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
# Check for existing application
##########################################################

Write-Host "Checking for existing App Registration..."

$existing = Get-MgApplication `
    -Filter "displayName eq '$DisplayName'"

if ($existing) {

    Write-Host ""
    Write-Host "App Registration already exists."
    Write-Host ""
    Write-Host "Display Name : $DisplayName"
    Write-Host "Client ID    : $($existing.AppId)"
    Write-Host ""
    Write-Host "No changes made."

    return
}

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

Write-Host "Created."

##########################################################
# Create Enterprise Application
##########################################################

Write-Host ""
Write-Host "Creating Enterprise Application..."

$sp = New-MgServicePrincipal `
    -AppId $app.AppId

Write-Host "Created."

##########################################################
# Create Client Secret
##########################################################

Write-Host ""
Write-Host "Creating Client Secret..."

$password = Add-MgApplicationPassword `
    -ApplicationId $app.Id

$clientSecret = $password.SecretText

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
Write-Host "  nextauth-secret"

Write-Host ""

Write-Host "Next Step:"
Write-Host "Assign users to ADMIN / DOCTOR / NURSE roles from"
Write-Host "Enterprise Applications -> Users and Groups."