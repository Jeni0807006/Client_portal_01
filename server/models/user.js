const db = require('../config/db');

const User = {
    findByEmailOrUsername: async (email, username) => {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE email = ? OR username = ?', 
            [email, username]
        );
        return rows;
    },

    create: async (username, email, hashedPassword) => {
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', 
            [username, email, hashedPassword]
        );
        return result;
    }
};

module.exports = User;