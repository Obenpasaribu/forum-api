class CommentLikeController {
  constructor(commentLikeService) {
    this._commentLikeService = commentLikeService;
    this.putLike = this.putLike.bind(this);
  }

  async putLike(req, res, next) {
    try {
      const owner = req.auth.credentials.id;
      const { threadId, commentId } = req.params;
      await this._commentLikeService.toggleLike({ threadId, commentId, owner });
      res.status(200).json({ status: 'success' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CommentLikeController;
