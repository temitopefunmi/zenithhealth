import sql from 'mssql';

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: false,
        connectTimeout: 60000, // Wait up to 60s for the initial handshake
        requestTimeout: 30000
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
 * 🛠️ Easy Schema Management
 * To add a new column, just add an object to this array.
 */
async function ensureSchema(pool) {
    const requiredColumns = [
        { name: 'patientName',     type: 'NVARCHAR(255) NOT NULL' },
        { name: 'doctor',          type: 'NVARCHAR(255) NULL' },
        { name: 'appointmentDate', type: 'DATETIME NOT NULL' },
        { name: 'status',          type: 'NVARCHAR(50) DEFAULT \'Scheduled\'' },
        { name: 'notes',           type: 'NVARCHAR(MAX) NULL' },
        { name: 'createdAt',       type: 'DATETIME DEFAULT GETDATE()' }
    ];

    // Ensure the base table exists
    await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') AND type in (N'U'))
        BEGIN
            CREATE TABLE [dbo].[Appointments] ( [id] INT IDENTITY(1,1) PRIMARY KEY );
        END
    `);

    // Auto-add any missing columns from the array above
    for (const col of requiredColumns) {
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') AND name = '${col.name}')
            BEGIN
                ALTER TABLE [dbo].[Appointments] ADD [${col.name}] ${col.type};
            END
        `);
    }
}

/**
 * 🚀 Final ExecuteQuery with Auto-Retry Logic
 */
export async function executeQuery(query, params = {}, retryCount = 0) {
    const MAX_RETRIES = 3;

    try {
        const pool = await getConnection();
        
        // Self-heal the schema before every request
        await ensureSchema(pool);

        const request = pool.request();
        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value);
        });

        return await request.query(query);

    } catch (err) {
        // Detect if the error is a "Cold Start" (Database is paused)
        const isColdStart = err.code === 'ELOGIN' || 
                           err.message.includes('not currently available') ||
                           err.message.includes('Resource ID');

        if (isColdStart && retryCount < MAX_RETRIES) {
            console.warn(`⚠️ Azure SQL is waking up. Retry attempt ${retryCount + 1}/${MAX_RETRIES}...`);
            
            // Wait 3 seconds before trying again
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            return executeQuery(query, params, retryCount + 1);
        }

        // If it's a real error or we ran out of retries, throw it to the UI
        console.error('Final Database Error:', err);
        throw err;
    }
}