import sql from 'mssql';

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: false,
        // 🚀 Stability Fixes for Serverless
        connectTimeout: 60000, 
        requestTimeout: 30000,
        tdsVersion: '7_4', // Modern Azure SQL protocol
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let poolPromise;

async function getConnection() {
    if (!poolPromise) {
        poolPromise = sql.connect(config);
    }
    return poolPromise;
}

/**
 * 🛡️ The "Auto-Migrator": 
 * Ensures the table exists and all required columns are present.
 */
async function ensureSchema(pool) {
    // 1. Define your "Source of Truth" for the schema
    const requiredColumns = [
        { name: 'patientName',     type: 'NVARCHAR(100) NOT NULL' },
        { name: 'doctor',          type: 'NVARCHAR(100) NULL' },
        { name: 'appointmentDate', type: 'DATETIME NOT NULL' },
        { name: 'status',          type: 'NVARCHAR(50) DEFAULT \'Scheduled\'' },
        { name: 'notes',           type: 'NVARCHAR(MAX) NULL' },
        { name: 'createdAt',       type: 'DATETIME DEFAULT GETDATE()' }
    ];

    // 2. Initial Table Creation (Bootstrap)
    const bootstrapQuery = `
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') AND type in (N'U'))
        BEGIN
            CREATE TABLE [dbo].[Appointments] (
                [id] INT IDENTITY(1,1) PRIMARY KEY
            );
        END
    `;
    await pool.request().query(bootstrapQuery);

    // 3. 🚀 Dynamic Column Check: Loops through and adds any missing fields
    for (const col of requiredColumns) {
        const alterQuery = `
            IF NOT EXISTS (SELECT * FROM sys.columns 
                           WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') 
                           AND name = '${col.name}')
            BEGIN
                ALTER TABLE [dbo].[Appointments] ADD [${col.name}] ${col.type};
                PRINT 'Added column: ${col.name}';
            END
        `;
        await pool.request().query(alterQuery);
    }
}

export async function executeQuery(query, params = {}) {
    try {
        const pool = await getConnection();
        
        // Self-heal the schema before running the request
        await ensureSchema(pool);

        const request = pool.request();
        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value);
        });

        const result = await request.query(query);
        return result;
    } catch (err) {
        console.error('Database Error:', err);
        // Special check for common Serverless errors
        if (err.code === 'ELOGIN' || err.message.includes('not currently available')) {
            console.error('PRO-TIP: Database might be waking up from Pause. Try refreshing in 30 seconds.');
        }
        throw err;
    }
}