// server/models/User.js
const oracledb = require('oracledb');
const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');

class User {
    static async findByEmail(email) {
        const sql = `SELECT user_id, name, email, phone, address, hashed_pass, user_type, status, created_at 
                     FROM users WHERE email = :email`;
        
        const result = await executeQuery(sql, [email]);
        
        if (!result.success) {
            throw new Error(`Database error: ${result.error}`);
        }
        
        if (result.rows.length === 0) return null;
        
        // Oracle returns column names in uppercase by default
        const user = result.rows[0];
        return {
            user_id: user.USER_ID,
            name: user.NAME,
            email: user.EMAIL,
            phone: user.PHONE,
            address: user.ADDRESS,
            password: user.HASHED_PASS, // Map hashed_pass to password for compatibility
            user_type: user.USER_TYPE,
            status: user.STATUS,
            created_at: user.CREATED_AT
        };
    }

    static async create(userData) {
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
        
        const sql = `INSERT INTO users (name, email, phone, address, hashed_pass, user_type)
                     VALUES (:name, :email, :phone, :address, :hashed_pass, :user_type)
                     RETURNING user_id INTO :user_id`;
        
        const binds = {
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            address: userData.address,
            hashed_pass: hashedPassword, // Use correct column name
            user_type: userData.user_type,
            user_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };
        
        const result = await executeQuery(sql, binds);
        
        if (!result.success) {
            throw new Error(`Failed to create user: ${result.error}`);
        }
        
        return {
            user_id: result.outBinds.user_id[0],
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            address: userData.address,
            user_type: userData.user_type
        };
    }

    static async findById(userId) {
        const sql = `SELECT user_id, name, email, phone, address, user_type, status, created_at 
                     FROM users WHERE user_id = :user_id`;
        
        const result = await executeQuery(sql, [userId]);
        
        if (!result.success) {
            throw new Error(`Database error: ${result.error}`);
        }
        
        if (result.rows.length === 0) return null;
        
        const user = result.rows[0];
        return {
            user_id: user.USER_ID,
            name: user.NAME,
            email: user.EMAIL,
            phone: user.PHONE,
            address: user.ADDRESS,
            user_type: user.USER_TYPE,
            status: user.STATUS,
            created_at: user.CREATED_AT
        };
    }

    static async update(userId, updateData) {
        const fields = [];
        const binds = { user_id: userId };
        
        // Dynamically build UPDATE query based on provided fields
        if (updateData.name) {
            fields.push('name = :name');
            binds.name = updateData.name;
        }
        if (updateData.email) {
            fields.push('email = :email');
            binds.email = updateData.email;
        }
        if (updateData.phone) {
            fields.push('phone = :phone');
            binds.phone = updateData.phone;
        }
        if (updateData.address) {
            fields.push('address = :address');
            binds.address = updateData.address;
        }
        if (updateData.status) {
            fields.push('status = :status');
            binds.status = updateData.status;
        }
        if (updateData.password) {
            const hashedPassword = await bcrypt.hash(updateData.password, 10);
            fields.push('hashed_pass = :hashed_pass');
            binds.hashed_pass = hashedPassword;
        }
        
        if (fields.length === 0) {
            throw new Error('No fields to update');
        }
        
        const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                     WHERE user_id = :user_id`;
        
        const result = await executeQuery(sql, binds);
        
        if (!result.success) {
            throw new Error(`Failed to update user: ${result.error}`);
        }
        
        return result.rowsAffected > 0;
    }

    static async delete(userId) {
        const sql = `DELETE FROM users WHERE user_id = :user_id`;
        
        const result = await executeQuery(sql, [userId]);
        
        if (!result.success) {
            throw new Error(`Failed to delete user: ${result.error}`);
        }
        
        return result.rowsAffected > 0;
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static async emailExists(email) {
        const user = await this.findByEmail(email);
        return !!user;
    }

    static async getAllUsers(limit = 100, offset = 0) {
        const sql = `SELECT user_id, name, email, phone, address, user_type, status, created_at 
                     FROM users 
                     ORDER BY created_at DESC 
                     OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
        
        const result = await executeQuery(sql, [offset, limit]);
        
        if (!result.success) {
            throw new Error(`Database error: ${result.error}`);
        }
        
        return result.rows.map(user => ({
            user_id: user.USER_ID,
            name: user.NAME,
            email: user.EMAIL,
            phone: user.PHONE,
            address: user.ADDRESS,
            user_type: user.USER_TYPE,
            status: user.STATUS,
            created_at: user.CREATED_AT
        }));
    }

    static async searchUsers(searchTerm) {
        const sql = `SELECT user_id, name, email, phone, address, user_type, status, created_at 
                     FROM users 
                     WHERE LOWER(name) LIKE LOWER(:searchTerm) 
                        OR LOWER(email) LIKE LOWER(:searchTerm)
                        OR LOWER(phone) LIKE LOWER(:searchTerm)
                     ORDER BY name`;
        
        const result = await executeQuery(sql, [`%${searchTerm}%`]);
        
        if (!result.success) {
            throw new Error(`Database error: ${result.error}`);
        }
        
        return result.rows.map(user => ({
            user_id: user.USER_ID,
            name: user.NAME,
            email: user.EMAIL,
            phone: user.PHONE,
            address: user.ADDRESS,
            user_type: user.USER_TYPE,
            status: user.STATUS,
            created_at: user.CREATED_AT
        }));
    }
}

module.exports = User;