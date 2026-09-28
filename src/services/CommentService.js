class CommentService {
  constructor(commentRepository, threadRepository) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async addComment({ content, owner, threadId }) {
    await this._threadRepository.verifyThreadExists(threadId);
    return this._commentRepository.addComment({ content, owner, threadId });
  }

  async deleteComment({ threadId, commentId, owner }) {
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId, threadId);
    await this._commentRepository.verifyCommentOwner(commentId, owner);
    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = CommentService;
