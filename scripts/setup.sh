#!/bin/bash

# --- CONFIGURATION ---
PROJECT_NAME="zenith"
APP_NAME="zht-dashboard"
LOCATION="westeurope"
MGMT_RG="rg-${PROJECT_NAME}-mgmt"
STORAGE_NAME="${PROJECT_NAME}tfstate$(date +%s)" # Generates a unique name
CONTAINER_NAME="tfstate"
IDENTITY_NAME="id-${PROJECT_NAME}-github"
GITHUB_REPO="temitopefunmi/zenithhealth"
OUTPUT_FILE="azure-setup-output.txt"
MODEL_NAME="gpt-4.1-mini"
RESOURCE_GROUP="rg-ZenithHealth"

echo "Step 1: Creating Management Resource Group..."
az group create --name $MGMT_RG --location $LOCATION

echo "Step 2: Checking/Creating Storage Account for Terraform State..."
if [ $(az storage account check-name --name $STORAGE_NAME --query 'nameAvailable' -o tsv) == "true" ]; then
    az storage account create --resource-group $MGMT_RG --name $STORAGE_NAME --sku Standard_LRS --encryption-services blob
    az storage container create --name $CONTAINER_NAME --account-name $STORAGE_NAME
else
    echo "Storage account $STORAGE_NAME already exists. Skipping creation."
fi

echo "Step 3: Creating User-Assigned Managed Identity..."
IDENTITY_JSON=$(az identity create --name $IDENTITY_NAME --resource-group $MGMT_RG)
CLIENT_ID=$(echo $IDENTITY_JSON | jq -r .clientId)
TENANT_ID=$(az account show --query tenantId -o tsv)
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# -----------------------------
# Step 4: Poll until identity is available in Azure AD
# -----------------------------
echo "Step 4: Waiting for managed identity to propagate in Azure AD..."
MAX_RETRIES=12
SLEEP_SEC=5
RETRY_COUNT=0

until az ad sp show --id $CLIENT_ID &> /dev/null; do
    ((RETRY_COUNT++))
    if [ $RETRY_COUNT -gt $MAX_RETRIES ]; then
        echo "ERROR: Managed Identity $CLIENT_ID did not appear in Azure AD after $((MAX_RETRIES*SLEEP_SEC)) seconds."
        exit 1
    fi
    echo "Waiting for managed identity to appear in Azure AD... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep $SLEEP_SEC
done

echo "Managed identity is now available in Azure AD. Assigning Contributor role..."
az role assignment create --assignee $CLIENT_ID --role "Contributor" --scope "/subscriptions/$SUBSCRIPTION_ID"

# -----------------------------
# Step 5: Sync secrets/variables to GitHub
# -----------------------------
gh secret set AZURE_CLIENT_ID --body "$CLIENT_ID"
gh secret set AZURE_TENANT_ID --body "$TENANT_ID"
gh secret set AZURE_SUBSCRIPTION_ID --body "$SUBSCRIPTION_ID"
gh variable set APP_NAME --body "$APP_NAME"
gh variable set STORAGE_ACCOUNT_NAME --body "$STORAGE_NAME"
gh variable set RESOURCE_GROUP --body "$RESOURCE_GROUP"
gh variable set MODEL_NAME --body "$MODEL_NAME"

# -----------------------------
# Step 6: Create OIDC Federated Credential
# -----------------------------
az identity federated-credential create \
    --name "github-actions" \
    --identity-name $IDENTITY_NAME \
    --resource-group $MGMT_RG \
    --issuer "https://token.actions.githubusercontent.com" \
    --subject "repo:${GITHUB_REPO}:ref:refs/heads/main" \
    --audiences "api://AzureADTokenExchange"

# -----------------------------
# Step 7: Save output for reference
# -----------------------------
{
    echo "--- AZURE OIDC SETUP FOR ZENITH HEALTH ---"
    echo "Date: $(date)"
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
echo "Success! GitHub Secrets and Variables have been synced automatically."
echo "The federated credential is ready for OIDC login."
echo "--------------------------------------------------------"