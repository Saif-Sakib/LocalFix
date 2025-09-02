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

// Universal query function for SELECT operations
async function executeQuery(sql, binds = [], options = {}) {
    let connection;
    try {
        connection = await oracledb.getConnection();
        
        const defaultOptions = {
            outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as objects instead of arrays
            autoCommit: false
        };
        
        const executeOptions = { ...defaultOptions, ...options };
        const result = await connection.execute(sql, binds, executeOptions);
        
        return {
            success: true,
            rows: result.rows,
            rowsAffected: result.rowsAffected,
            metaData: result.metaData,
            outBinds: result.outBinds
        };
    } catch (error) {
        console.error('Database query error:', error);
        return {
            success: false,
            error: error.message,
            code: error.errorNum
        };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// Universal function for INSERT, UPDATE, DELETE operations (with transaction support)
async function executeTransaction(sql, binds = [], options = {}) {
    let connection;
    try {
        connection = await oracledb.getConnection();
        
        const defaultOptions = {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
            autoCommit: true // Auto-commit for single operations
        };
        
        const executeOptions = { ...defaultOptions, ...options };
        const result = await connection.execute(sql, binds, executeOptions);
        
        return {
            success: true,
            rows: result.rows,
            rowsAffected: result.rowsAffected,
            metaData: result.metaData,
            outBinds: result.outBinds
        };
    } catch (error) {
        console.error('Database transaction error:', error);
        return {
            success: false,
            error: error.message,
            code: error.errorNum
        };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// For complex transactions with multiple operations
async function executeMultipleQueries(queries) {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const results = [];
        
        // Start transaction
        for (const { sql, binds = [], options = {} } of queries) {
            const defaultOptions = {
                outFormat: oracledb.OUT_FORMAT_OBJECT,
                autoCommit: false
            };
            
            const executeOptions = { ...defaultOptions, ...options };
            const result = await connection.execute(sql, binds, executeOptions);
            results.push({
                success: true,
                rows: result.rows,
                rowsAffected: result.rowsAffected,
                outBinds: result.outBinds
            });
        }
        
        // Commit all operations
        await connection.commit();
        
        return {
            success: true,
            results
        };
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Database transaction error:', error);
        return {
            success: false,
            error: error.message,
            code: error.errorNum
        };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// Helper function to get connection for custom operations
async function getConnection() {
    return await oracledb.getConnection();
}

// Helper function to format bind parameters for logging (removes sensitive data)
function sanitizeBindsForLogging(binds) {
    if (Array.isArray(binds)) return binds.map(bind => typeof bind === 'string' && bind.length > 50 ? '[LONG_STRING]' : bind);
    if (typeof binds === 'object' && binds !== null) {
        const sanitized = {};
        for (const [key, value] of Object.entries(binds)) {
            if (key.toLowerCase().includes('password') || key.toLowerCase().includes('secret')) {
                sanitized[key] = '[HIDDEN]';
            } else if (typeof value === 'string' && value.length > 50) {
                sanitized[key] = '[LONG_STRING]';
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
    return binds;
}

module.exports = {
    initializeDatabase,
    closeDatabase,
    executeQuery,        // For SELECT operations
    executeTransaction,  // For INSERT, UPDATE, DELETE operations
    executeMultipleQueries, // For complex transactions
    getConnection,       // For custom operations that need manual connection handling
    dbConfig
};