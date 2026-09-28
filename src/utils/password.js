const bcrypt = require('bcrypt');
const InvariantError = require('../commons/exceptions/InvariantError');

const SALT_ROUNDS = 10;

const hash = async (password) => bcrypt.hash(password, SALT_ROUNDS);

const compare = async (password, hashedPassword) => {
  const isValid = await bcrypt.compare(password, hashedPassword);
  if (!isValid) {
    throw new InvariantError('kredensial yang Anda masukkan salah');
  }
};

module.exports = { hash, compare };
