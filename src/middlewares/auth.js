const jwt = require('jsonwebtoken');
const AuthenticationError = require('../commons/exceptions/AuthenticationError');

/**
 * Verifies the Bearer access token on the Authorization header and attaches
 * the decoded payload (containing the user id) to req.auth.credentials.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AuthenticationError('Missing authentication'));
  }

  const accessToken = authHeader.slice('Bearer '.length);

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY);
    req.auth = { credentials: { id: decoded.id } };
    return next();
  } catch (error) {
    return next(new AuthenticationError('Missing authentication'));
  }
};

module.exports = authenticate;
