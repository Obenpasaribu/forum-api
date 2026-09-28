const InvariantError = require('../commons/exceptions/InvariantError');

const USERNAME_MAX_LENGTH = 50;
const USERNAME_REGEX = /^[\w]+$/;

const validateAddUserPayload = (payload) => {
  const { username, password, fullname } = payload || {};

  if (!username || !password || !fullname) {
    throw new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada');
  }

  if (
    typeof username !== 'string'
    || typeof password !== 'string'
    || typeof fullname !== 'string'
  ) {
    throw new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai');
  }

  if (username.length > USERNAME_MAX_LENGTH) {
    throw new InvariantError(`tidak dapat membuat user baru karena karakter username melebihi batas limit (${USERNAME_MAX_LENGTH})`);
  }

  if (!USERNAME_REGEX.test(username)) {
    throw new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang');
  }
};

module.exports = { validateAddUserPayload };
