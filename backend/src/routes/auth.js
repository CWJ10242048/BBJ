const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

// 数据库连接配置
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'bbj'
};

// 登录接口
router.post('/login', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        // 创建数据库连接
        const connection = await mysql.createConnection(dbConfig);

        // 查询用户
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE username = ? AND role = ?',
            [username, role.toUpperCase()]
        );

        // 关闭数据库连接
        await connection.end();

        if (rows.length === 0) {
            return res.json({
                code: 401,
                message: '用户名或角色错误'
            });
        }

        const user = rows[0];

        // 直接比较密码
        if (password !== user.password) {
            return res.json({
                code: 401,
                message: '密码错误'
            });
        }

        // 生成 JWT token
        const token = jwt.sign(
            { 
                id: user.id,
                username: user.username,
                role: user.role
            },
            'your-secret-key',  // 请替换为你的密钥
            { expiresIn: '24h' }
        );

        // 返回用户信息和token
        res.json({
            code: 200,
            message: '登录成功',
            token: token,
            data: {
                id: user.id,
                username: user.username,
                nickname: user.nickname,
                avatar_url: user.avatar_url,
                phone: user.phone,
                email: user.email,
                school: user.school,
                subject: user.subject,
                role: user.role
            }
        });

    } catch (error) {
        console.error('登录错误:', error);
        res.json({
            code: 500,
            message: '服务器错误'
        });
    }
});

module.exports = router; 