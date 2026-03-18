const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Tạo folder keys nếu chưa có
const keysDir = path.join(__dirname, 'keys');
if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
}

// Tạo RSA key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

// Lưu files
fs.writeFileSync(path.join(keysDir, 'jwt_private.key'), privateKey);
fs.writeFileSync(path.join(keysDir, 'jwt_public.key'), publicKey);

console.log('✅ Tạo RSA keys thành công!');
console.log('📁 Private key: src/keys/jwt_private.key');
console.log('📁 Public key: src/keys/jwt_public.key');