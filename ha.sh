#!/bin/bash

# LocalFix Project Setup - Step by Step Commands

# You're currently in: ~/Documents/Projects/LocalFix/localfix
# Let's create all the files you need

# 1. First, create the root package.json
cat > package.json << 'EOF'
{
  "name": "localfix",
  "version": "1.0.0",
  "description": "Local issue fixing platform",
  "main": "index.js",
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "cd server && npm run dev",
    "client": "cd client && npm run dev",
    "install-all": "npm install && cd client && npm install && cd ../server && npm install"
  },
  "keywords": ["localfix", "issues", "freelance"],
  "author": "Your Team",
  "license": "MIT",
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
EOF

# 2. Create client package.json
cat > client/package.json << 'EOF'
{
  "name": "localfix-client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.15.0",
    "axios": "^1.5.0",
    "react-hook-form": "^7.45.4",
    "react-hot-toast": "^2.4.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "vite": "^4.4.5"
  }
}
EOF

# 3. Create server package.json
cat > server/package.json << 'EOF'
{
  "name": "localfix-server",
  "version": "1.0.0",
  "description": "LocalFix Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["api", "express", "oracle"],
  "author": "Your Team",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "oracledb": "^6.0.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "express-validator": "^7.0.1",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

# 4. Create environment file
cat > .env << 'EOF'
# Database Configuration
DB_USER=local
DB_PASSWORD=fix
DB_CONNECT_STRING=localhost:1521/XE

# JWT Secret (change this to a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
EOF

# 5. Create .env.example
cat > .env.example << 'EOF'
# Database Configuration
DB_USER=your_oracle_username
DB_PASSWORD=your_oracle_password
DB_CONNECT_STRING=localhost:1521/XE

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
CLIENT_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
EOF

# 6. Create Vite config
cat > client/vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
EOF

# 7. Create database config
cat > server/config/database.js << 'EOF'
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
EOF

# 8. Create Express app
cat > server/app.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Basic route
app.get('/', (req, res) => {
    res.json({ 
        message: 'LocalFix API Server Running!',
        version: '1.0.0',
        status: 'OK'
    });
});

// API Routes (will be added by team members)
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/jobs', require('./routes/jobs'));
// app.use('/api/applications', require('./routes/applications'));
// app.use('/api/admin', require('./routes/admin'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
EOF

# 9. Create server entry point
cat > server/server.js << 'EOF'
const app = require('./app');
const { initializeDatabase, closeDatabase } = require('./config/database');

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
EOF

# 10. Create React HTML template
cat > client/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LocalFix - Fix Local Issues</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

# 11. Create React main.jsx
cat > client/src/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

# 12. Create React App.jsx
cat > client/src/App.jsx << 'EOF'
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>🔧 LocalFix</h1>
          <p>Fix Local Issues Together</p>
        </header>
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Add more routes here */}
          </Routes>
        </main>
      </div>
    </Router>
  )
}

// Temporary home page component
const HomePage = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h2>Welcome to LocalFix! 🏠</h2>
    <p>Platform to fix local community issues</p>
    <div style={{ marginTop: '30px' }}>
      <button style={{ margin: '10px', padding: '10px 20px' }}>Login</button>
      <button style={{ margin: '10px', padding: '10px 20px' }}>Register</button>
    </div>
  </div>
)

export default App
EOF

# 13. Create React CSS
cat > client/src/index.css << 'EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

.App {
  min-height: 100vh;
}

.App-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  text-align: center;
  color: white;
}

.App-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

button {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s ease;
}

button:hover {
  background: #5a67d8;
}
EOF

# 14. Create shared constants
cat > shared/constants.js << 'EOF'
// User Roles
export const USER_ROLES = {
    CITIZEN: 'citizen',
    WORKER: 'worker',
    ADMIN: 'admin'
};

// Job Status
export const JOB_STATUS = {
    OPEN: 'open',
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CLOSED: 'closed'
};

// Application Status
export const APPLICATION_STATUS = {
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under_review',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected'
};

// Issue Categories
export const ISSUE_CATEGORIES = {
    ROAD: 'Road & Infrastructure',
    ELECTRICITY: 'Electricity & Street Lights',
    WATER: 'Water & Sanitation',
    WASTE: 'Waste Management',
    SAFETY: 'Public Safety',
    OTHER: 'Others'
};

export const API_BASE_URL = 'http://localhost:5000/api';
EOF

# 15. Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
/client/dist
/client/build

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.sqlite

# Uploads
uploads/
!uploads/.gitkeep

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Temporary files
tmp/
temp/
EOF

# 16. Create README
cat > README.md << 'EOF'
# 🔧 LocalFix - Community Issue Fixing Platform

LocalFix is a platform that connects citizens who report local issues with workers who can fix them, managed by administrators.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Oracle Database
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Saif-Sakib/LocalFix.git
cd LocalFix
```

2. Install all dependencies:
```bash
npm run install-all
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Start development servers:
```bash
npm run dev
```

This will start:
- React frontend on http://localhost:3000
- Express backend on http://localhost:5000

## 👥 Team Members & Responsibilities

- **Member 1**: Authentication System (Login/Register)
- **Member 2**: Citizen Dashboard & Job Posting
- **Member 3**: Worker Dashboard & Applications
- **Member 4**: Admin Panel & Shared Components

## 📱 Features

- 🏠 **Citizens**: Post local issues, review applications, rate workers
- ⚒️ **Workers**: Browse jobs, submit applications, complete tasks
- 👨‍💼 **Admins**: Review applications, verify completions, manage platform

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: Oracle Database
- **Authentication**: JWT

## 📝 License

MIT License
EOF

# 17. Create empty .gitkeep files for upload directories
touch uploads/jobs/.gitkeep
touch uploads/proofs/.gitkeep
touch uploads/profiles/.gitkeep

echo "✅ All files created successfully!"
echo "Now run the following commands:"
echo ""
echo "# Install dependencies"
echo "npm run install-all"
echo ""
echo "# Add files to git and commit"
echo "git add ."
echo "git commit -m \"Initial LocalFix project setup\""
echo ""
echo "# Push to GitHub"
echo "git push -u origin main"
echo ""
echo "# Start development"
echo "npm run dev"