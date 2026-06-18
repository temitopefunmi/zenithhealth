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
let schemaInitialized = false;
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

// Ensure table exists
async function ensureTableExists(pool, tableName) {
  await pool.request().query(`
    IF NOT EXISTS (
      SELECT *
      FROM sys.objects
      WHERE object_id = OBJECT_ID(N'[dbo].[${tableName}]')
      AND type = 'U'
    )
    BEGIN
      CREATE TABLE [dbo].[${tableName}] (
        [id] INT IDENTITY(1,1) PRIMARY KEY
      );
    END
  `);
}

// Ensure required columns exist
async function ensureColumns(pool, tableName, columns) {
  for (const col of columns) {
    await pool.request().query(`
      IF NOT EXISTS (
        SELECT *
        FROM sys.columns
        WHERE object_id = OBJECT_ID(N'[dbo].[${tableName}]')
        AND name = '${col.name}'
      )
      BEGIN
        ALTER TABLE [dbo].[${tableName}]
        ADD [${col.name}] ${col.type};
      END
    `);
  }
}

/**
 * 🛠️ Ensure DB Schema Exists
 * Auto-creates table + missing columns (good for dev/demo environments)
 */
async function ensureSchema(pool) {
    // Appointments table with necessary columns
        const appointmentColumns = [
            { name: 'patientName', type: 'NVARCHAR(255) NOT NULL' },
            { name: 'doctorId', type: 'NVARCHAR(50) NULL' },
            { name: 'doctor', type: 'NVARCHAR(255) NULL' },
            { name: 'doctorEmail', type: 'NVARCHAR(255) NULL' },
            { name: "patientId", type: "NVARCHAR(50) NULL" },
            { name: "appointmentNumber", type: "NVARCHAR(50) NULL" },
            { name: 'appointmentDate', type: 'DATETIME NOT NULL' },

            { name: 'status', type: "NVARCHAR(50) DEFAULT 'Scheduled'" },

            { name: 'priority', type: "NVARCHAR(50) DEFAULT 'Low'" },

            { name: 'department', type: 'NVARCHAR(100) NULL' },

            { name: 'appointmentType', type: 'NVARCHAR(100) NULL' },

            { name: 'patientCategory', type: 'NVARCHAR(50) NULL' },
            
            { name: 'notes', type: 'NVARCHAR(MAX) NULL' },

            { name: 'aiReasoning', type: 'NVARCHAR(MAX) NULL' },

            { name: 'isVerified', type: 'BIT DEFAULT 0' },

            { name: 'createdBy', type: 'NVARCHAR(255) NULL' },

            { name: 'lastUpdatedBy', type: 'NVARCHAR(255) NULL' },

            { name: 'createdAt', type: 'DATETIME DEFAULT GETDATE()' }


        ];

    
    await ensureTableExists(pool, 'Appointments');
    await ensureColumns(pool, 'Appointments', appointmentColumns);

    // Patient table with necessary columns
    const patientColumns = [
        { name: "patientId", type: "NVARCHAR(50) NOT NULL" },
        { name: "fullName", type: "NVARCHAR(255) NOT NULL" },
        { name: "dateOfBirth", type: "DATE NULL" },
        { name: "gender", type: "NVARCHAR(20) NULL" },
        { name: "phone", type: "NVARCHAR(50) NULL" },
        { name: "email", type: "NVARCHAR(255) NULL" },
        { name: "address", type: "NVARCHAR(MAX) NULL" },
        { name: "emergencyContactName", type: "NVARCHAR(255) NULL" },
        { name: "emergencyContactPhone", type: "NVARCHAR(50) NULL" },
        { name: "bloodGroup", type: "NVARCHAR(10) NULL" },
        { name: "nationalId", type: "NVARCHAR(100) NULL" },
        { name: "insuranceProvider", type: "NVARCHAR(255) NULL" },
        { name: "insuranceNumber", type: "NVARCHAR(100) NULL" },
        { name: "createdAt", type: "DATETIME DEFAULT GETDATE()" }
        ];

    await ensureTableExists(pool, "Patients");
    await ensureColumns(pool, "Patients", patientColumns);

    // Nurse's assignment
    const nurseAssignmentColumns = [
        { name: "assignmentId", type: "NVARCHAR(50) NOT NULL" },
        { name: "appointmentId", type: "INT NULL" },
        { name: "patientId", type: "NVARCHAR(50) NULL" },
        { name: "nurseEmail", type: "NVARCHAR(255) NOT NULL" },
        { name: "ward", type: "NVARCHAR(100) NULL" },
        { name: "department", type: "NVARCHAR(100) NULL"},
        { name: "shift", type: "NVARCHAR(100) NULL" },
        { name: "status", type: "NVARCHAR(50) NULL" },
        { name: "assignedBy", type: "NVARCHAR(255) NULL" },
        { name: "assignedAt", type: "DATETIME DEFAULT GETDATE()" }
        ];

    await ensureTableExists(pool, "NurseAssignments");
    await ensureColumns(pool, "NurseAssignments", nurseAssignmentColumns);

    // Vitals
    const vitalsColumns = [
        { name: "appointmentId", type: "INT NULL" },
        { name: "patientId", type: "NVARCHAR(50) NULL" },
        { name: "recordedBy", type: "NVARCHAR(255) NULL" },
        { name: "temperature", type: "FLOAT NULL" },
        { name: "heartRate", type: "INT NULL" },
        { name: "bloodPressure", type: "NVARCHAR(50) NULL" },
        { name: "respiratoryRate", type: "INT NULL" },
        { name: "oxygenSaturation", type: "INT NULL" },
        { name: "weight", type: "INT NULL" },
        { name: "height", type: "INT NULL" },
        { name: "recordedAt", type: "DATETIME DEFAULT GETDATE()" }
        ];

    await ensureTableExists(pool, "Vitals");
    await ensureColumns(pool, "Vitals", vitalsColumns);

    // Medication Administration
    const medicationColumns = [
        { name: "appointmentId", type: "INT NULL" },
        { name: "patientId", type: "NVARCHAR(50) NULL" },
        { name: "medication", type: "NVARCHAR(255) NULL" },
        { name: "dosage", type: "NVARCHAR(100) NULL" },
        { name: "frequency", type: "NVARCHAR(100) NULL" },
        { name: "route", type: "NVARCHAR(100) NULL" },
        { name: "status", type: "NVARCHAR(50) NULL" },
        { name: "administeredBy", type: "NVARCHAR(255) NULL" },
        { name: "administeredAt", type: "DATETIME DEFAULT GETDATE()" }
        ];

    await ensureTableExists(pool, "MedicationAdministration");
    await ensureColumns(pool, "MedicationAdministration", medicationColumns);

    //Clinical Notes
    const clinicalNotesColumns = [
        { name: "appointmentId", type: "INT NULL" },
        { name: "patientId", type: "NVARCHAR(50) NULL" },
        { name: "doctorId", type: "NVARCHAR(50) NULL" },
        { name: "doctorEmail", type: "NVARCHAR(255) NULL" },
        { name: "note", type: "NVARCHAR(MAX) NULL" },
        { name: "createdBy", type: "NVARCHAR(255) NULL" },
        { name: "createdAt", type: "DATETIME DEFAULT GETDATE()" }
        ];

    await ensureTableExists(pool, "ClinicalNotes");
    await ensureColumns(pool, "ClinicalNotes", clinicalNotesColumns);

    // Department table
    const departmentColumns = [
        { name: "departmentCode", type: "NVARCHAR(50) NOT NULL" },
        { name: "departmentName", type: "NVARCHAR(255) NOT NULL" },
        { name: "ward", type: "NVARCHAR(100) NULL" },
        { name: "floor", type: "NVARCHAR(50) NULL" },
        { name: "headDoctor", type: "NVARCHAR(255) NULL" }
        ];

    await ensureTableExists(pool, "Departments");
    await ensureColumns(pool, "Departments", departmentColumns);

    // Doctors
    const doctorColumns = [
        { name: "doctorId", type: "NVARCHAR(50) NOT NULL" },
        { name: "fullName", type: "NVARCHAR(255) NOT NULL" },
        { name: "email", type: "NVARCHAR(255) NOT NULL" },
        { name: "departmentCode", type: "NVARCHAR(50) NULL" },
        { name: "specialization", type: "NVARCHAR(255) NULL" },
        { name: "status", type: "NVARCHAR(50) DEFAULT 'Active'" }
        ];

    await ensureTableExists(pool, "Doctors");
    await ensureColumns(pool, "Doctors", doctorColumns);

    // Nurses
    const nurseColumns = [
        { name: "nurseId", type: "NVARCHAR(50) NOT NULL" },
        { name: "fullName", type: "NVARCHAR(255) NOT NULL" },
        { name: "email", type: "NVARCHAR(255) NOT NULL" },
        { name: "departmentCode", type: "NVARCHAR(50) NULL" },
        { name: "ward", type: "NVARCHAR(100) NULL" },
        { name: "defaultShift", type: "NVARCHAR(50) NULL" },
        { name: "status", type: "NVARCHAR(50) DEFAULT 'Active'" }
        ];

    await ensureTableExists(pool, "Nurses");
    await ensureColumns(pool, "Nurses", nurseColumns);

    // Prescriptions
    const prescriptionColumns = [
        { name: "appointmentId", type: "INT NULL" },

        { name: "patientId", type: "NVARCHAR(50) NULL" },

        { name: "doctorId", type: "NVARCHAR(50) NULL" },

        { name: "doctorEmail", type: "NVARCHAR(255) NULL" },

        { name: "medication", type: "NVARCHAR(255) NULL" },

        { name: "dosage", type: "NVARCHAR(100) NULL" },

        { name: "frequency", type: "NVARCHAR(100) NULL" },

        { name: "duration", type: "NVARCHAR(100) NULL" },

        { name: "instructions", type: "NVARCHAR(MAX) NULL" },

        { name: "status", type: "NVARCHAR(50) DEFAULT 'Pending'" },

        { name: "createdAt", type: "DATETIME DEFAULT GETDATE()" }
        ];

    await ensureTableExists(pool, "Prescriptions");
    await ensureColumns(pool, "Prescriptions", prescriptionColumns);

}

// Ensure schema is ready
export async function initializeSchema() {
    if (schemaInitialized) {
        return;
    }

    const pool = await getConnection();

    console.log("🔨 Ensuring database schema...");

    await ensureSchema(pool);

    schemaInitialized = true;
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

        await initializeSchema();   

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