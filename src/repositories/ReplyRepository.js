const { generateId } = require('../utils/id');
const NotFoundError = require('../commons/exceptions/NotFoundError');
const AuthorizationError = require('../commons/exceptions/AuthorizationError');

class ReplyRepository {
  constructor(pool) {
    this._pool = pool;
  }

  async addReply({ content, owner, commentId }) {
    const id = generateId('reply');
    const date = new Date().toISOString();
    const query = {
      text: `INSERT INTO replies (id, comment_id, content, owner, date)
             VALUES ($1, $2, $3, $4, $5) RETURNING id, content, owner`,
      values: [id, commentId, content, owner, date],
    };
    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async verifyReplyExists(id) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }
  }

  async verifyReplyOwner(id, owner, commentId) {
    const query = commentId
      ? { text: 'SELECT owner FROM replies WHERE id = $1 AND comment_id = $2', values: [id, commentId] }
      : { text: 'SELECT owner FROM replies WHERE id = $1', values: [id] };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }
    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async deleteReply(id) {
    const query = {
      text: 'UPDATE replies SET is_delete = TRUE WHERE id = $1',
      values: [id],
    };
    await this._pool.query(query);
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `SELECT replies.id, users.username, replies.date, replies.content, replies.is_delete
             FROM replies
             LEFT JOIN users ON replies.owner = users.id
             WHERE replies.comment_id = $1
             ORDER BY replies.date ASC`,
      values: [commentId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = ReplyRepository;
