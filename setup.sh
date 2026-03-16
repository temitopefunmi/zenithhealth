#!/bin/bash

# --- CONFIGURATION ---
PROJECT_NAME="zenith"
APP_NAME="zht-portal-web"
LOCATION="westeurope"
MGMT_RG="rg-${PROJECT_NAME}-mgmt"
STORAGE_NAME="${PROJECT_NAME}tfstate$(date +%s)" # Generates a unique name
CONTAINER_NAME="tfstate"
IDENTITY_NAME="id-${PROJECT_NAME}-github"
GITHUB_REPO="temitopefunmi/zenithhealth" # Change 'username/repo-name' to your actual GitHub repository in the format 'username/repo-name'
OUTPUT_FILE="azure-setup-output.txt"

echo "Step 1: Creating Management Resource Group..."
az group create --name $MGMT_RG --location $LOCATION

echo "Step 2: Checking/Creating Storage Account for Terraform State..."
# Checking if storage exists first so we don't duplicate
if [ $(az storage account check-name --name $STORAGE_NAME --query 'nameAvailable' -o tsv) == "true" ]; then
    az storage account create --resource-group $MGMT_RG --name $STORAGE_NAME --sku Standard_LRS --encryption-services blob
    az storage container create --name $CONTAINER_NAME --account-name $STORAGE_NAME
else
    echo "Storage account $STORAGE_NAME already exists. Skipping creation."
fi

echo "Step 3: Creating User-Assigned Managed Identity..."
# Create the Identity
IDENTITY_JSON=$(az identity create --name $IDENTITY_NAME --resource-group $MGMT_RG)
CLIENT_ID=$(echo $IDENTITY_JSON | jq -r .clientId)
TENANT_ID=$(az account show --query tenantId -o tsv)
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

echo "Step 4: Assigning Contributor Role to the Identity..."
# Give the identity power over the subscription
az role assignment create --assignee $CLIENT_ID --role "Contributor" --scope "/subscriptions/$SUBSCRIPTION_ID"

echo "Step 5: Syncing Secrets to GitHub using 'gh' CLI..."
# This pushes the secrets directly to your repo
gh secret set AZURE_CLIENT_ID --body "$CLIENT_ID"
gh secret set AZURE_TENANT_ID --body "$TENANT_ID"
gh secret set AZURE_SUBSCRIPTION_ID --body "$SUBSCRIPTION_ID"
gh variable set APP_NAME --body "$APP_NAME"

echo "Step 6: Creating the OIDC Handshake (Federated Credential)..."
# This is the critical step to link GitHub Actions with Azure AD via OIDC
az identity federated-credential create \
    --name "github-actions" \
    --identity-name $IDENTITY_NAME \
    --resource-group $MGMT_RG \
    --issuer "https://token.actions.githubusercontent.com" \
    --subject "repo:${GITHUB_REPO}:ref:refs/heads/main" \
    --audiences "api://AzureADTokenExchange"

echo "Step 7: Saving details to $OUTPUT_FILE for reference..."
{
    echo "--- AZURE OIDC SETUP FOR ZENITH HEALTH ---"
    echo "Date: $(date)"
    echo "Edit terraform.tfvars to update these values if needed before running Terraform."
    echo "Subscription ID: $SUBSCRIPTION_ID"
    echo "Tenant ID:       $TENANT_ID"
    echo "Management RG:   $MGMT_RG"
    echo "Identity Name:   $IDENTITY_NAME"
    echo "Client ID:       $CLIENT_ID"
    echo "Storage Account: $STORAGE_NAME"
    echo "App Name:        $APP_NAME"
    echo ""
    echo "NOTE: No password (client secret) was created because we are using OIDC."
} > $OUTPUT_FILE

echo "--------------------------------------------------------"
echo "Success! GitHub Secrets have been synced automatically."
echo "CRITICAL: You must now run Terraform to create the Federated Identity Credential"
echo "to complete the OIDC handshake."
echo "--------------------------------------------------------"