const { generateId } = require('../utils/id');

class CommentLikeRepository {
  constructor(pool) {
    this._pool = pool;
  }

  async isCommentLikedByUser(commentId, owner) {
    const query = {
      text: 'SELECT id FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };
    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async addLike(commentId, owner) {
    const id = generateId('like');
    const query = {
      text: 'INSERT INTO comment_likes (id, comment_id, owner) VALUES ($1, $2, $3)',
      values: [id, commentId, owner],
    };
    await this._pool.query(query);
  }

  async removeLike(commentId, owner) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };
    await this._pool.query(query);
  }

  async toggleLike(commentId, owner) {
    const alreadyLiked = await this.isCommentLikedByUser(commentId, owner);
    if (alreadyLiked) {
      await this.removeLike(commentId, owner);
    } else {
      await this.addLike(commentId, owner);
    }
  }

  async getLikeCountsByCommentIds(commentIds) {
    if (!commentIds.length) return {};
    const query = {
      text: `SELECT comment_id, COUNT(*)::int AS like_count
             FROM comment_likes
             WHERE comment_id = ANY($1::text[])
             GROUP BY comment_id`,
      values: [commentIds],
    };
    const result = await this._pool.query(query);
    return result.rows.reduce((acc, row) => {
      acc[row.comment_id] = row.like_count;
      return acc;
    }, {});
  }
}

module.exports = CommentLikeRepository;
