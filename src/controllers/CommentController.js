const { validateAddCommentPayload } = require('../validators/commentValidator');

class CommentController {
  constructor(commentService) {
    this._commentService = commentService;
    this.postComment = this.postComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
  }

  async postComment(req, res, next) {
    try {
      validateAddCommentPayload(req.body);
      const owner = req.auth.credentials.id;
      const { threadId } = req.params;
      const addedComment = await this._commentService.addComment({
        content: req.body.content,
        owner,
        threadId,
      });
      res.status(201).json({
        status: 'success',
        data: { addedComment },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req, res, next) {
    try {
      const owner = req.auth.credentials.id;
      const { threadId, commentId } = req.params;
      await this._commentService.deleteComment({ threadId, commentId, owner });
      res.status(200).json({ status: 'success' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CommentController;
