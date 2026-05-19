const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'crm_secret_key';

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error('Unauthorized');
  const token = authHeader.split(' ')[1];
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { verifyToken, JWT_SECRET };
