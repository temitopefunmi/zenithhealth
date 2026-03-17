import { executeQuery } from './lib/db.js';

async function init() {
    try {
        console.log("Creating Appointment table...");
        await executeQuery(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Appointments' AND xtype='U')
            CREATE TABLE Appointments (
                id INT IDENTITY(1,1) PRIMARY KEY,
                patient NVARCHAR(255),
                doctor NVARCHAR(255),
                createdAt DATETIME DEFAULT GETDATE()
            )
        `);

        console.log("Pushing test record...");
        await executeQuery(
            `INSERT INTO Appointments (patient, doctor) VALUES (@patient, @doctor)`,
            { patient: 'John Doe', doctor: 'Dr. Smith' }
        );

        console.log("✅ Success! Table created and record pushed.");
    } catch (err) {
        console.error("❌ Setup failed. Check firewall/credentials.");
    }
}

init();