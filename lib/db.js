import sql from 'mssql';
console.log("ENV VALUE:", process.env.SQL_SECRET_KEY);
console.log("ENV LENGTH:", process.env.SQL_SECRET_KEY?.length);
const config = {
    user: 'sqladminuser', 
    password: process.env.SQL_SECRET_KEY,
    server: 'sql-zht-dashboard.database.windows.net',
    database: 'db-zht-dashboard',
    options: {
        encrypt: true, 
        trustServerCertificate: false
    }
};

export async function executeQuery(query, params = {}) {
    try {
        const pool = await sql.connect(config);
        const request = pool.request();
        
        // Safety: Add parameters to prevent SQL injection
        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value);
        });

        const result = await request.query(query);
        return result;
    } catch (err) {
        console.error('SQL Error: ', err);
        throw err;
    }
}