import sql from 'mssql';

/**
 * 🕵️ Validate that secrets from Key Vault are actually resolved
 * Azure sometimes injects placeholders like @Microsoft.KeyVault(...)
 * before resolving them — we don’t want to connect with those.
 */
function validateSecrets() {
    const criticalKeys = [
        'DB_PASSWORD',
        'AZURE_OPENAI_API_KEY',
        'AZURE_OPENAI_ENDPOINT'
    ];

    for (const key of criticalKeys) {
        const value = process.env[key];

        if (!value || value.startsWith('@Microsoft.KeyVault')) {
            console.error(
                `🚨 CRITICAL: ${key} is NOT resolved. Current value: ${value}`
            );

            // In production, fail fast so Azure restarts the app
            if (process.env.NODE_ENV === 'production') {
                throw new Error(
                    `Infrastructure warming up: ${key} not ready`
                );
            }
        }
    }
}

/**
 * 🧱 SQL Connection Config
 */
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: false,
        connectTimeout: 60000,
        requestTimeout: 30000
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

/**
 * 🔁 Global connection pool
 * We reuse this across requests for performance
 */
let poolPromise = null;

/**
 * 🔌 Get SQL Connection (with pool reuse)
 * If connection fails, we reset the pool so next attempt is fresh
 */
async function getConnection() {
    validateSecrets();

    try {
        if (!poolPromise) {
            console.log("🔌 Creating new SQL connection pool...");
            poolPromise = sql.connect(config);
        }

        return await poolPromise;

    } catch (err) {
        console.warn("♻️ Connection failed. Resetting pool...");
        poolPromise = null;
        throw err;
    }
}

/**
 * 🛠️ Ensure DB Schema Exists
 * Auto-creates table + missing columns (good for dev/demo environments)
 */
async function ensureSchema(pool) {
    const requiredColumns = [
        { name: 'patientName', type: 'NVARCHAR(255) NOT NULL' },
        { name: 'doctor', type: 'NVARCHAR(255) NULL' },
        { name: 'appointmentDate', type: 'DATETIME NOT NULL' },
        { name: 'status', type: "NVARCHAR(50) DEFAULT 'Scheduled'" },
        { name: 'notes', type: 'NVARCHAR(MAX) NULL' },
        { name: 'createdAt', type: 'DATETIME DEFAULT GETDATE()' },
        { name: 'priority', type: "NVARCHAR(50) DEFAULT 'Low'" },
        { name: 'aiReasoning', type: 'NVARCHAR(MAX) NULL' },
        { name: 'isVerified', type: 'BIT DEFAULT 0' }
    ];

    // Ensure table exists
    await pool.request().query(`
        IF NOT EXISTS (
            SELECT * FROM sys.objects 
            WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') 
            AND type = 'U'
        )
        BEGIN
            CREATE TABLE [dbo].[Appointments] (
                [id] INT IDENTITY(1,1) PRIMARY KEY
            );
        END
    `);

    // Add missing columns
    for (const col of requiredColumns) {
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT * FROM sys.columns 
                WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') 
                AND name = '${col.name}'
            )
            BEGIN
                ALTER TABLE [dbo].[Appointments] 
                ADD [${col.name}] ${col.type};
            END
        `);
    }
}

/**
 * 🚀 Execute Query with Retry Logic
 * Handles Azure SQL Serverless cold starts gracefully
 */
export async function executeQuery(query, params = {}, retryCount = 0) {
    const MAX_RETRIES = 10;
    const RETRY_DELAY = 5000; // 5 seconds

    try {
        const pool = await getConnection();

        // Ensure schema is ready
        await ensureSchema(pool);

        const request = pool.request();

        // Attach query parameters safely
        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value);
        });

        return await request.query(query);

    } catch (err) {
        const isColdStart =
            err.code === 'ELOGIN' ||
            err.message.includes('not currently available') ||
            err.message.includes('Resource ID');

        if (isColdStart && retryCount < MAX_RETRIES) {
            console.warn(
                `⚠️ Azure SQL waking up... Retry ${retryCount + 1}/${MAX_RETRIES}`
            );

            // 🔥 Reset stale pool BEFORE retry
            console.warn("♻️ Resetting SQL connection pool...");
            poolPromise = null;

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

            return executeQuery(query, params, retryCount + 1);
        }

        // Final failure
        console.error('❌ Final Database Error:', err);
        throw err;
    }
}