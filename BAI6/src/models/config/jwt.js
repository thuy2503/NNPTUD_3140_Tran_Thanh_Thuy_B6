const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const privateKeyPath = path.join(__dirname, '..', '..', 'keys', 'jwt_private.key');
const publicKeyPath = path.join(__dirname, '..', '..', 'keys', 'jwt_public.key');

let privateKey, publicKey;

try {
    privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    publicKey = fs.readFileSync(publicKeyPath, 'utf8');
    console.log('✅ RSA Keys loaded');
} catch (error) {
    console.error('❌ Error loading keys:', error.message);
    console.log('⚠️ Run: node create-keys.js');
}

const signToken = (payload) => {
    return jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: process.env.JWT_EXPIRE || '1h',
        issuer: process.env.JWT_ISSUER || 'myapp',
        audience: process.env.JWT_AUDIENCE || 'myapp-users'
    });
};

const verifyToken = (token) => {
    return jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
        issuer: process.env.JWT_ISSUER || 'myapp',
        audience: process.env.JWT_AUDIENCE || 'myapp-users'
    });
};

module.exports = { signToken, verifyToken, publicKey, privateKey };