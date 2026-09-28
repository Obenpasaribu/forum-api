const DELETED_COMMENT_CONTENT = '**komentar telah dihapus**';
const DELETED_REPLY_CONTENT = '**balasan telah dihapus**';

/**
 * Composes a full thread detail: the thread itself, its comments (each with
 * its replies and like count), respecting soft-deleted content placeholders.
 */
class ThreadDetailService {
  constructor(threadRepository, commentRepository, replyRepository, commentLikeRepository) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async getThreadDetail(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const rawComments = await this._commentRepository.getCommentsByThreadId(threadId);

    const commentIds = rawComments.map((comment) => comment.id);
    const likeCounts = await this._commentLikeRepository.getLikeCountsByCommentIds(commentIds);

    const comments = await Promise.all(
      rawComments.map(async (comment) => {
        const rawReplies = await this._replyRepository.getRepliesByCommentId(comment.id);
        const replies = rawReplies.map((reply) => ({
          id: reply.id,
          content: reply.is_delete ? DELETED_REPLY_CONTENT : reply.content,
          date: reply.date,
          username: reply.username,
        }));

        return {
          id: comment.id,
          username: comment.username,
          date: comment.date,
          content: comment.is_delete ? DELETED_COMMENT_CONTENT : comment.content,
          likeCount: likeCounts[comment.id] || 0,
          replies,
        };
      })
    );

    return {
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments,
    };
  }
}

module.exports = ThreadDetailService;
