# Install PowerShell modules

Install-Module Az -Scope CurrentUser

Install-Module Microsoft.Graph -Scope CurrentUser

# (Optional)
Set-PSRepository -Name PSGallery -InstallationPolicy Trusted