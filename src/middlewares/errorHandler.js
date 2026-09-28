const ClientError = require('../commons/exceptions/ClientError');
const AuthenticationError = require('../commons/exceptions/AuthenticationError');

/* eslint-disable no-unused-vars */
const errorHandler = (err, req, res, next) => {
  if (err instanceof ClientError) {
    return res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    });
  }

  if (err instanceof AuthenticationError) {
    return res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    });
  }

  // Malformed JSON body (thrown by express.json())
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      status: 'fail',
      message: 'payload tidak valid',
    });
  }

  // Unexpected / server error
  console.error(err);
  return res.status(500).json({
    status: 'error',
    message: 'terjadi kegagalan pada server kami',
  });
};

module.exports = errorHandler;
