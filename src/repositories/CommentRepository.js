const { generateId } = require('../utils/id');
const NotFoundError = require('../commons/exceptions/NotFoundError');
const AuthorizationError = require('../commons/exceptions/AuthorizationError');

class CommentRepository {
  constructor(pool) {
    this._pool = pool;
  }

  async addComment({ content, owner, threadId }) {
    const id = generateId('comment');
    const date = new Date().toISOString();
    const query = {
      text: `INSERT INTO comments (id, thread_id, content, owner, date)
             VALUES ($1, $2, $3, $4, $5) RETURNING id, content, owner`,
      values: [id, threadId, content, owner, date],
    };
    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async verifyCommentExists(id, threadId) {
    const query = threadId
      ? { text: 'SELECT id FROM comments WHERE id = $1 AND thread_id = $2', values: [id, threadId] }
      : { text: 'SELECT id FROM comments WHERE id = $1', values: [id] };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async verifyCommentOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async deleteComment(id) {
    const query = {
      text: 'UPDATE comments SET is_delete = TRUE WHERE id = $1',
      values: [id],
    };
    await this._pool.query(query);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id, users.username, comments.date, comments.content, comments.is_delete
             FROM comments
             LEFT JOIN users ON comments.owner = users.id
             WHERE comments.thread_id = $1
             ORDER BY comments.date ASC`,
      values: [threadId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = CommentRepository;
