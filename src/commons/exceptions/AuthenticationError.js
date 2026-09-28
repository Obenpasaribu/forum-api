class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
    this.name = 'AuthenticationError';
  }
}

module.exports = AuthenticationError;
