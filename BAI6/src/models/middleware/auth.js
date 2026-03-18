const { verifyToken } = require('../config/jwt');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Yêu cầu đăng nhập' 
        });
    }
    
    try {
        req.user = verifyToken(token);
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: 'Token không hợp lệ' 
        });
    }
};

module.exports = authenticateToken;