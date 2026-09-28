class CommentLikeService {
  constructor(commentLikeRepository, commentRepository, threadRepository) {
    this._commentLikeRepository = commentLikeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async toggleLike({ threadId, commentId, owner }) {
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId, threadId);
    await this._commentLikeRepository.toggleLike(commentId, owner);
  }
}

module.exports = CommentLikeService;
