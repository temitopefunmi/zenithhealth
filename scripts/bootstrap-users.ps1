<#
=========================================================
Zenith HealthTech - Bootstrap Users
=========================================================

Creates Microsoft Entra users and optionally assigns
application roles:

- ADMIN
- DOCTOR
- NURSE

Custom users may optionally be assigned one of the
above roles.
-----------------------
- Creates Microsoft Entra users
- Forces password change on first sign in
- Optionally assigns ADMIN / DOCTOR / NURSE application roles
- Safe to rerun for existing users
- Skips creation if user is found

Examples:

.\bootstrap-users.ps1

.\bootstrap-users.ps1 `
    -UserType Admin `
    -DisplayName "Amy Smith" `
    -Username amy

.\bootstrap-users.ps1 `
    -UserType Doctor `
    -DisplayName "John Doe" `
    -Username john

=========================================================
#>

param(
    [string]$AppName = "Zenith Health Portal",

    [ValidateSet("Admin","Doctor","Nurse","Custom")]
    [string]$UserType,

    [string]$DisplayName,

    [string]$Username
)

Write-Host ""
Write-Host "====================================="
Write-Host " Zenith User Bootstrap"
Write-Host "====================================="
Write-Host ""


##########################################################
# Graph Login
##########################################################

Write-Host ""
Write-Host "Connecting to Microsoft Graph..."

Connect-MgGraph `
    -Scopes `
        "User.ReadWrite.All",
        "Application.ReadWrite.All",
        "AppRoleAssignment.ReadWrite.All"

Write-Host ""
Write-Host "Connected."
Write-Host ""


##########################################################
# Tenant Domain
##########################################################

$tenantDomain = (
    Get-MgOrganization |
    Select-Object -First 1
).VerifiedDomains |
Where-Object {
    $_.IsDefault -eq $true
} |
Select-Object -ExpandProperty Name

Write-Host "Tenant:"
Write-Host "  $tenantDomain"
Write-Host ""

##########################################################
# Interactive Menu
##########################################################

if (-not $UserType) {

    Write-Host "1) Admin"
    Write-Host "2) Doctor"
    Write-Host "3) Nurse"
    Write-Host "4) Custom"
    Write-Host ""

    $choice = Read-Host "Choice"

    switch ($choice) {

        "1" { $UserType = "Admin" }

        "2" { $UserType = "Doctor" }

        "3" { $UserType = "Nurse" }

        "4" { $UserType = "Custom" }

        default {
            throw "Invalid selection."
        }
    }
}

##########################################################
# Defaults
##########################################################

switch ($UserType) {

    "Admin" {

        if (-not $DisplayName) {
            $DisplayName = "Zenith Admin"
        }

        if (-not $Username) {
            $Username = "admin"
        }
    }

    "Doctor" {

        if (-not $DisplayName) {
            $DisplayName = "Zenith Doctor"
        }

        if (-not $Username) {
            $Username = "doctor"
        }
    }

    "Nurse" {

        if (-not $DisplayName) {
            $DisplayName = "Zenith Nurse"
        }

        if (-not $Username) {
            $Username = "nurse"
        }
    }

    "Custom" {

        if (-not $DisplayName) {
            $DisplayName = Read-Host "Display Name"
        }

        if (-not $Username) {
            $Username = Read-Host "Username (without @)"
        }
    }
}

$userPrincipalName = "$Username@$tenantDomain"

Write-Host ""
Write-Host "User:"
Write-Host "  $userPrincipalName"
Write-Host ""

##########################################################
# Check Existing User
##########################################################

$existingUser = Get-MgUser `
    -Filter "userPrincipalName eq '$userPrincipalName'" `
    -ErrorAction SilentlyContinue

$userAlreadyExists = $false

if ($existingUser) {

    $userAlreadyExists = $true
    $newUser = $existingUser

    Write-Host ""
    Write-Host "====================================="
    Write-Host "User Already Exists"
    Write-Host "====================================="
    Write-Host ""

    Write-Host "Display Name:"
    Write-Host "  $($existingUser.DisplayName)"

    Write-Host ""

    Write-Host "UPN:"
    Write-Host "  $($existingUser.UserPrincipalName)"

    Write-Host ""

    Write-Host "Object ID:"
    Write-Host "  $($existingUser.Id)"

    Write-Host ""
    Write-Host "Skipping user creation..."
}

if (-not $userAlreadyExists) {

    ##########################################################
    # Generate Password
    ##########################################################

    Add-Type -AssemblyName System.Web

    $tempPassword = [System.Web.Security.Membership]::GeneratePassword(20,4)

    ##########################################################
    # Create User
    ##########################################################

    Write-Host ""
    Write-Host "Creating user..."

    $passwordProfile = @{
        Password = $tempPassword
        ForceChangePasswordNextSignIn = $true
    }

    $newUser = New-MgUser `
        -AccountEnabled `
        -DisplayName $DisplayName `
        -MailNickname $Username `
        -UserPrincipalName $userPrincipalName `
        -PasswordProfile $passwordProfile

    if (-not $newUser) {
        throw "Failed to create user."
    }

    Write-Host "User created."
    Write-Host ""
}

##########################################################
# Assign Application Role
##########################################################

##########################################################
# Determine Role
##########################################################

$roleToAssign = $null

if ($UserType -eq "Custom") {

    Write-Host ""
    Write-Host "Assign application role?"
    Write-Host ""
    Write-Host "1) ADMIN"
    Write-Host "2) DOCTOR"
    Write-Host "3) NURSE"
    Write-Host "4) None"
    Write-Host ""

    $roleChoice = Read-Host "Choice"

    switch ($roleChoice) {

        "1" { $roleToAssign = "ADMIN" }

        "2" { $roleToAssign = "DOCTOR" }

        "3" { $roleToAssign = "NURSE" }

        default { $roleToAssign = $null }
    }

}
else {

    $roleToAssign = $UserType.ToUpper()

}

if ($roleToAssign) {

    Write-Host ""
    Write-Host "Assigning application role..."

    #
    # Find Enterprise Application
    #

    $servicePrincipal = Get-MgServicePrincipal -All |
        Where-Object {
            $_.DisplayName -eq $AppName
    } | Select-Object -First 1

     if (-not $servicePrincipal) {
        throw "Enterprise Application '$AppName' not found."
    }

    #
    # Find the role (ADMIN / DOCTOR / NURSE)
    #

    $appRole = $servicePrincipal.AppRoles |
        Where-Object {
            $_.Value -and $_.Value.ToUpper() -eq $roleToAssign.ToUpper()
        } | Select-Object -First 1

    if (-not $appRole) {
        throw "App role '$roleToAssign' not found."
    }

    #
    # Check if already assigned
    #

    $existingAssignment =
        Get-MgUserAppRoleAssignment `
            -UserId $newUser.Id `
            -All |
        Where-Object {
            $_.AppRoleId -eq $appRole.Id
        } | Select-Object -First 1

    if ($existingAssignment) {

        Write-Host "$roleToAssign role already assigned."

    }
    else {

        New-MgUserAppRoleAssignment `
            -UserId $newUser.Id `
            -PrincipalId $newUser.Id `
            -ResourceId $servicePrincipal.Id `
            -AppRoleId $appRole.Id

        Write-Host "$roleToAssign role assigned."
    }
}

##########################################################
# Summary
##########################################################

Write-Host ""
Write-Host "====================================="
Write-Host "User Created Successfully"
Write-Host "====================================="
Write-Host ""

Write-Host "Application Role:"

if ($roleToAssign) {
    Write-Host "  $roleToAssign"
}
else {
    Write-Host "  None"
}

Write-Host ""

Write-Host "Display Name:"
Write-Host "  $DisplayName"

Write-Host ""

Write-Host "User Principal Name:"
Write-Host "  $userPrincipalName"

Write-Host ""

if (-not $userAlreadyExists) {

    Write-Host "Temporary Password:"
    Write-Host "  $tempPassword"

    Write-Host ""

    Write-Host "The user must change their password"
    Write-Host "at first sign in."

}
else {

    Write-Host "Existing user reused."
    Write-Host "No password was changed."

}

