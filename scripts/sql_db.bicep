param serverName string 
param databaseName string 
param location string 

// Reference the server Terraform created
resource sqlServer 'Microsoft.Sql/servers@2024-11-01-preview' existing = {
  name: serverName
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2024-11-01-preview' = {
  parent: sqlServer
  name: databaseName
  location: location
  sku: {
    name: 'GP_S_Gen5_2'   // Free General Purpose Serverless, Gen5, 2 vCores
    tier: 'GeneralPurpose'
    family: 'Gen5'
    capacity: 2
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS' // Default collation
    maxSizeBytes: 34359738368 // 32 GB max size for free tier
    zoneRedundant: false // Not zone redundant
    readScale: 'Disabled' // All reads/writes go to the primary.
    useFreeLimit: true // Enable free tier limits
    freeLimitExhaustionBehavior: 'AutoPause' // Auto-pause when free limit is exhausted
  }
} 
