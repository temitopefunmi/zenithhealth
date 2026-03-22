#!/bin/bash

# 1. Config - The only thing you need to provide
RG_NAME="rg-ZenithHealth"

echo "🔍 Discovering infrastructure in $RG_NAME..."

# 2. Discover SQL Server Name and Admin Username
# We get the first server found in the resource group
SQL_SERVER_DATA=$(az sql server list --resource-group "$RG_NAME" --query "[0].{host:fullyQualifiedDomainName, user:administratorLogin, name:name}" -o json)
SQL_SERVER=$(echo $SQL_SERVER_DATA | jq -r '.host')
SQL_ADMIN_USER=$(echo $SQL_SERVER_DATA | jq -r '.user')
SQL_SERVER_NAME=$(echo $SQL_SERVER_DATA | jq -r '.name')
# We get the first database found on that server (excluding the 'master' system db)
DB_NAME=$(az sql db list --resource-group "$RG_NAME" --server "$SQL_SERVER_NAME" --query "[?name!='master'].name | [0]" -o tsv)

# Validation
if [ "$SQL_SERVER" == "null" ] || [ -z "$DB_NAME" ]; then
  echo "❌ Error: Could not find SQL resources. Check your RG name and login status."
  exit 1
fi

echo "✅ Found Server: $SQL_SERVER"
echo "✅ Found Database: $DB_NAME"
echo "✅ Found Admin User: $SQL_ADMIN_USER"

# 3. Get Infrastructure Details
echo "🔍 Gathering Azure details..."
SUB_ID=$(az account show --query id -o tsv)
MY_ID=$(az ad signed-in-user show --query id -o tsv)
KV_NAME=$(az keyvault list --resource-group "$RG_NAME" --query "[0].name" -o tsv)


if [ -z "$KV_NAME" ] || [ -z "$SQL_SERVER" ]; then
  echo "❌ Could not retrieve Key Vault or SQL Server details. Check your resource group."
  exit 1
fi

# 4. Grant Key Vault access policy to current CLI user
echo "🛡️ Granting Key Vault secret permissions to $MY_ID..."
az keyvault set-policy \
    --name "$KV_NAME" \
    --object-id "$MY_ID" \
    --secret-permissions get list

# 5. Wait for permissions to propagate
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


# 6. Fetch the Password from Key Vault
echo "🔓 Fetching SQL password from $KV_NAME..."
DB_PASSWORD=$(az keyvault secret show --name "sql-admin-password" --vault-name "$KV_NAME" --query "value" -o tsv)

# 7. Generate the .env.local file
cat <<EOF > .env.local
# Generated via setup-env.sh on $(date)
DB_USER=$SQL_ADMIN_USER
# Ensure special characters are preserved in the password by using raw string syntax if needed
DB_PASSWORD="$DB_PASSWORD" 
DB_SERVER=$SQL_SERVER
DB_NAME=$DB_NAME
EOF

echo "✨ .env.local created successfully!"