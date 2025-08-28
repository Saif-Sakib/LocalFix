// server/models/User.js
const oracledb = require('oracledb');
const bcrypt = require('bcryptjs');

class User {
    static async findByEmail(email) {
        let connection;
        try {
            connection = await oracledb.getConnection();
            const result = await connection.execute(
                `SELECT user_id, name, email, phone, address, password, user_type, status, created_at 
                 FROM users WHERE email = :email`,
                [email]
            );
            
            if (result.rows.length === 0) return null;
            
            const row = result.rows[0];
            return {
                user_id: row[0],
                name: row[1],
                email: row[2],
                phone: row[3],
                address: row[4],
                password: row[5],
                user_type: row[6],
                status: row[7],
                created_at: row[8]
            };
        } finally {
            if (connection) await connection.close();
        }
    }

    static async create(userData) {
        let connection;
        try {
            connection = await oracledb.getConnection();
            
            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
            
            const result = await connection.execute(
                `INSERT INTO users (name, email, phone, address, password, user_type)
                 VALUES (:name, :email, :phone, :address, :password, :user_type)
                 RETURNING user_id INTO :user_id`,
                {
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    address: userData.address,
                    password: hashedPassword,
                    user_type: userData.user_type,
                    user_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
                }
            );
            
            await connection.commit();
            
            return {
                user_id: result.outBinds.user_id[0],
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                address: userData.address,
                user_type: userData.user_type
            };
        } finally {
            if (connection) await connection.close();
        }
    }

    static async findById(userId) {
        let connection;
        try {
            connection = await oracledb.getConnection();
            const result = await connection.execute(
                `SELECT user_id, name, email, phone, address, user_type, status, created_at 
                 FROM users WHERE user_id = :user_id`,
                [userId]
            );
            
            if (result.rows.length === 0) return null;
            
            const row = result.rows[0];
            return {
                user_id: row[0],
                name: row[1],
                email: row[2],
                phone: row[3],
                address: row[4],
                user_type: row[5],
                status: row[6],
                created_at: row[7]
            };
        } finally {
            if (connection) await connection.close();
        }
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static async emailExists(email) {
        const user = await this.findByEmail(email);
        return !!user;
    }
}

module.exports = User;