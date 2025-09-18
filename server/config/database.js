const oracledb = require('oracledb');
require('dotenv').config();

// FIX: Automatically convert CLOBs to strings on fetch
oracledb.fetchAsString = [oracledb.CLOB];

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
    poolTimeout: 300,            // seconds to free idle connections
    queueTimeout: 5000,          // ms to wait for a free connection before timing out
    stmtCacheSize: 60,           // per-connection statement cache (default is 30)
    poolAlias: 'default'         // make the pool explicit for clarity
};

async function initializeDatabase() {
    try {
        await oracledb.createPool(poolConfig);
        console.log('✅ Oracle connection pool created successfully');

        // Test connection (explicitly from the pool)
        const pool = oracledb.getPool('default');
        const connection = await pool.getConnection();
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
        let pool;
        try {
            pool = oracledb.getPool('default');
        } catch (_) {
            try {
                // fallback to the only pool if alias wasn't used
                pool = oracledb.getPool();
            } catch (__) {
                pool = null;
            }
        }
        if (pool) {
            await pool.close(10);
            console.log('Database connection pool closed');
        } else {
            console.log('No database pool to close');
        }
    } catch (error) {
        console.error('Error closing database:', error);
    }
}

async function executeQuery(sql, binds = [], options = {}) {
    let connection;
    try {
        // Always acquire from our pool
        connection = await oracledb.getPool('default').getConnection();

        const defaultOptions = {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
            autoCommit: false
        };

        // Merge user options
        const executeOptions = { ...defaultOptions, ...options };

        // Detect query type
        const queryType = sql.trim().split(/\s+/)[0].toUpperCase();

        // For DML statements (INSERT, UPDATE, DELETE, MERGE), force autoCommit = true
        if (["INSERT", "UPDATE", "DELETE", "MERGE"].includes(queryType)) {
            executeOptions.autoCommit = true;
        }

        const result = await connection.execute(sql, binds, executeOptions);

        return {
            success: true,
            rows: result.rows,
            rowsAffected: result.rowsAffected,
            metaData: result.metaData,
            outBinds: result.outBinds
        };
    } catch (error) {
        // Log a safe preview for troubleshooting
        const sqlPreview = (typeof sql === 'string') ? sql.slice(0, 200) : '[non-string-sql]';
        console.error("Database query error:", error, { sqlPreview, binds: sanitizeBindsForLogging(binds) });
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
        connection = await oracledb.getPool('default').getConnection();
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
    executeQuery,        // For all operations
    executeMultipleQueries, // For complex transactions
    getConnection,       // For custom operations that need manual connection handling
    dbConfig
};