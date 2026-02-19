const crypto = require('crypto');

console.log('\n🔐 GENERATING SECURE JWT SECRETS\n');
console.log('Copy these into your .env file:\n');

const jwtSecret = crypto.randomBytes(64).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
const encryptionKey = crypto.randomBytes(32).toString('hex');

console.log('# JWT Configuration');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
console.log('');
console.log('# Encryption Key');
console.log(`ENCRYPTION_KEY=${encryptionKey}`);
console.log('\n✅ Update your .env file with these values!\n');
