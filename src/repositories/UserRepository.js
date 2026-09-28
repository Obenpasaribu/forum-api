const { generateId } = require('../utils/id');
const InvariantError = require('../commons/exceptions/InvariantError');

class UserRepository {
  constructor(pool) {
    this._pool = pool;
  }

  async verifyUsernameAvailable(username) {
    const query = {
      text: 'SELECT id FROM users WHERE username = $1',
      values: [username],
    };
    const result = await this._pool.query(query);
    if (result.rowCount > 0) {
      throw new InvariantError('username tidak tersedia');
    }
  }

  async addUser({ username, password, fullname }) {
    const id = generateId('user');
    const query = {
      text: 'INSERT INTO users (id, username, password, fullname) VALUES ($1, $2, $3, $4) RETURNING id, username, fullname',
      values: [id, username, password, fullname],
    };
    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async getPasswordByUsername(username) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('username tidak ditemukan');
    }
    return result.rows[0];
  }

  async getUserById(id) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    return result.rows[0];
  }
}

module.exports = UserRepository;
