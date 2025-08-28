const app = require('./app');
const { initializeDatabase, closeDatabase } = require('./config/database');
require('dotenv').config();
console.log("Loaded JWT_SECRET:", process.env.JWT_SECRET ? "✅ defined" : "❌ undefined");

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        // Initialize database
        await initializeDatabase();
        
        // Start server
        const server = app.listen(PORT, () => {
            console.log(`🚀 LocalFix server running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        // Graceful shutdown
        process.on('SIGTERM', async () => {
            console.log('SIGTERM received, shutting down gracefully');
            server.close(() => {
                closeDatabase();
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
