const InvariantError = require('../commons/exceptions/InvariantError');

const validateAddReplyPayload = (payload) => {
  const { content } = payload || {};

  if (!content) {
    throw new InvariantError('tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada');
  }

  if (typeof content !== 'string') {
    throw new InvariantError('tidak dapat membuat balasan baru karena tipe data tidak sesuai');
  }
};

module.exports = { validateAddReplyPayload };
