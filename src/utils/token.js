const jwt = require('jsonwebtoken');
const InvariantError = require('../commons/exceptions/InvariantError');

const generateAccessToken = (payload) => jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, {
  expiresIn: Number(process.env.ACCESS_TOKEN_AGE) || 3000,
});

const generateRefreshToken = (payload) => jwt.sign(payload, process.env.REFRESH_TOKEN_KEY);

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_KEY);
  } catch (error) {
    throw new InvariantError('refresh token tidak valid');
  }
};

const decodePayload = (token) => jwt.decode(token);

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  decodePayload,
};
