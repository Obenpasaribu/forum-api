const InvariantError = require('../commons/exceptions/InvariantError');

const validateAddCommentPayload = (payload) => {
  const { content } = payload || {};

  if (!content) {
    throw new InvariantError('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
  }

  if (typeof content !== 'string') {
    throw new InvariantError('tidak dapat membuat comment baru karena tipe data tidak sesuai');
  }
};

module.exports = { validateAddCommentPayload };
