#!/bin/bash

# -------------------------------
# Zenith Health Setup Script
# -------------------------------

# 1. Config from your variables.tf
RG_NAME="rg-Zenith"
APP_NAME="zht-dashboard"
DB_NAME="db-zht-dashboard"
SQL_ADMIN_USER="sqladminuser"

# 2. Get Infrastructure Details
echo "🔍 Gathering Azure details..."
SUB_ID=$(az account show --query id -o tsv)
MY_ID=$(az ad signed-in-user show --query id -o tsv)
KV_NAME=$(az keyvault list --resource-group "$RG_NAME" --query "[0].name" -o tsv)
SQL_SERVER=$(az sql server list --resource-group "$RG_NAME" --query "[0].fullyQualifiedDomainName" -o tsv)

if [ -z "$KV_NAME" ] || [ -z "$SQL_SERVER" ]; then
  echo "❌ Could not retrieve Key Vault or SQL Server details. Check your resource group."
  exit 1
fi

# 3. Grant Key Vault access policy to current CLI user
echo "🛡️ Granting Key Vault secret permissions to $MY_ID..."
az keyvault set-policy \
    --name "$KV_NAME" \
    --object-id "$MY_ID" \
    --secret-permissions get list

# 4. Wait for permissions to propagate
echo "⏳ Waiting for Azure to authorize your identity..."
COUNT=0
while ! az keyvault secret list --vault-name "$KV_NAME" &> /dev/null; do
    COUNT=$((COUNT + 1))
    echo "🔄 Still waiting... (Attempt $COUNT)"
    sleep 10
    if [ $COUNT -ge 12 ]; then
        echo "❌ Timeout: Please check your Key Vault access in the Portal."
        exit 1
    fi
done
echo "✅ Authorization confirmed!"

# 5. Fetch the SQL password
echo "🔓 Fetching SQL password..."
DB_PASSWORD=$(az keyvault secret show --name "sql-admin-password" --vault-name "$KV_NAME" --query "value" -o tsv)

if [ -z "$DB_PASSWORD" ]; then
  echo "❌ No SQL password found in Key Vault."
  exit 1
fi

# 6. Encode password for URI safety
ENCODED_PASSWORD=$(node -e "console.log(encodeURIComponent(process.argv[1]))" "$DB_PASSWORD")

# 7. Write Prisma-compatible .env
cat <<EOF > .env
DATABASE_URL="sqlserver://${SQL_ADMIN_USER}@${APP_NAME}:${ENCODED_PASSWORD}@${SQL_SERVER}:1433/${DB_NAME}?encrypt=true&trustServerCertificate=false&hostNameInCertificate=*.database.windows.net&loginTimeout=30"
EOF

echo "✨ .env file created successfully!"
echo "👉 Run 'npx prisma db push' now."
