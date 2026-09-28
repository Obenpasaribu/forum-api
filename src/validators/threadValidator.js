const InvariantError = require('../commons/exceptions/InvariantError');

const validateAddThreadPayload = (payload) => {
  const { title, body } = payload || {};

  if (!title || !body) {
    throw new InvariantError('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
  }

  if (typeof title !== 'string' || typeof body !== 'string') {
    throw new InvariantError('tidak dapat membuat thread baru karena tipe data tidak sesuai');
  }

  if (title.length > 100) {
    throw new InvariantError('tidak dapat membuat thread baru karena karakter title melebihi batas limit (100)');
  }
};

module.exports = { validateAddThreadPayload };
