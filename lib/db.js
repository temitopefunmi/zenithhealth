import sql from 'mssql';

const config = {
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true, 
        trustServerCertificate: false,
        connectTimeout: 30000 // Pro-Tip: Increased timeout for Serverless "Cold Starts"
    }
};

let poolPromise;

// 1. Singleton pattern to manage connections efficiently
async function getConnection() {
    if (!poolPromise) {
        poolPromise = sql.connect(config);
    }
    return poolPromise;
}

// 2. The "Self-Healer": Creates the table if Bicep/Terraform hasn't
async function ensureSchema(pool) {
    const schemaQuery = `
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') AND type in (N'U'))
        BEGIN
            CREATE TABLE [dbo].[Appointments] (
                [id] INT IDENTITY(1,1) PRIMARY KEY,
                [patientName] NVARCHAR(100) NOT NULL,
                [appointmentDate] DATETIME NOT NULL,
                [status] NVARCHAR(50) DEFAULT 'Scheduled',
                [notes] NVARCHAR(MAX) NULL,
                [createdAt] DATETIME DEFAULT GETDATE()
            );
        END
    `;
    await pool.request().query(schemaQuery);
}

export async function executeQuery(query, params = {}) {
    try {
        const pool = await getConnection();
        
        // Ensure table exists before running the actual query
        await ensureSchema(pool);

        const request = pool.request();
        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value);
        });

        const result = await request.query(query);
        return result;
    } catch (err) {
        console.error('Database Error:', err);
        throw err;
    }
}