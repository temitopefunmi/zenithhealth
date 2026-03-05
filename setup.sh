#!/bin/bash

# --- CONFIGURATION ---
PROJECT_NAME="zenith"
LOCATION="eastus"
MGMT_RG="rg-${PROJECT_NAME}-mgmt"
STORAGE_NAME="${PROJECT_NAME}tfstate$(date +%s)" # Generates a unique name
CONTAINER_NAME="tfstate"
OUTPUT_FILE="azure-setup-output.txt"

echo "Step 1: Creating Management Resource Group..."
az group create --name $MGMT_RG --location $LOCATION

echo "Step 2: Creating Storage Account for Terraform State..."
az storage account create --resource-group $MGMT_RG --name $STORAGE_NAME --sku Standard_LRS --encryption-services blob
az storage container create --name $CONTAINER_NAME --account-name $STORAGE_NAME

echo "Step 3: Creating Service Principal..."
# Get Subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# Create SP and capture the JSON output
SP_JSON=$(az ad sp create-for-rbac --name "github-${PROJECT_NAME}-devops" --role contributor --scopes /subscriptions/$SUBSCRIPTION_ID --sdk-auth)

echo "Step 4: Saving details to $OUTPUT_FILE..."
{
    echo "--- AZURE SETUP FOR ZENITH HEALTH ---"
    echo "Date: $(date)"
    echo "Subscription ID: $SUBSCRIPTION_ID"
    echo "Management RG: $MGMT_RG"
    echo "Storage Account Name: $STORAGE_NAME"
    echo "Container Name: $CONTAINER_NAME"
    echo ""
    echo "--- SERVICE PRINCIPAL JSON (FOR GITHUB SECRETS) ---"
    echo "$SP_JSON"
} > $OUTPUT_FILE

echo "Success! Please check $OUTPUT_FILE for your credentials."
echo "CRITICAL: Do not commit $OUTPUT_FILE to GitHub!"