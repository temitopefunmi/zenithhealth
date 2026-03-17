import sql from 'mssql';
// Had to debug the environment variable to ensure it's being read correctly
console.log("ENV VALUE:", process.env.DB_PASSWORD);
console.log("ENV LENGTH:", process.env.DB_PASSWORD?.length);

const config = {
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
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