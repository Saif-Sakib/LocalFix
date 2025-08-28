const oracledb = require('oracledb');
require('dotenv').config();

// Database configuration using your settings
const dbConfig = {
    user: process.env.DB_USER || 'local',
    password: process.env.DB_PASSWORD || 'fix',
    connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/XE'
};

// Connection pool configuration
const poolConfig = {
    user: dbConfig.user,
    password: dbConfig.password,
    connectString: dbConfig.connectString,
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 1,
    poolTimeout: 300
};

async function initializeDatabase() {
    try {
        await oracledb.createPool(poolConfig);
        console.log('✅ Oracle connection pool created successfully');
        
        // Test connection
        const connection = await oracledb.getConnection();
        const result = await connection.execute(`SELECT 'Database Connected!' FROM DUAL`);
        console.log('✅', result.rows[0][0]);
        await connection.close();
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        process.exit(1);
    }
}

async function closeDatabase() {
    try {
        await oracledb.getPool().close(10);
        console.log('Database connection pool closed');
    } catch (error) {
        console.error('Error closing database:', error);
    }
}

module.exports = {
    initializeDatabase,
    closeDatabase,
    dbConfig
};
