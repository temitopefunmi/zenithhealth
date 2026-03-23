import { executeQuery } from './lib/db.js';

async function init() {
    try {
        console.log("🚀 Initializing Database...");
        
        // Calling any query will trigger the 'ensureSchema' in lib/db.js 
        // which creates the table and all columns correctly.
        await executeQuery('SELECT TOP 1 * FROM Appointments');

        console.log("📝 Pushing test record with correct mapping...");
        await executeQuery(
            `INSERT INTO Appointments (patientName, doctor, appointmentDate, status) 
             VALUES (@patientName, @doctor, GETDATE(), 'Confirmed')`,
            { 
                patientName: 'John Doe', 
                doctor: 'Dr. Smith' 
            }
        );

        console.log("✅ Success! Database is synced and test record created.");
    } catch (err) {
        console.error("❌ Setup failed:", err.message);
    }
}

init();