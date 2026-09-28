const { validateAddReplyPayload } = require('../validators/replyValidator');

class ReplyController {
  constructor(replyService) {
    this._replyService = replyService;
    this.postReply = this.postReply.bind(this);
    this.deleteReply = this.deleteReply.bind(this);
  }

  async postReply(req, res, next) {
    try {
      validateAddReplyPayload(req.body);
      const owner = req.auth.credentials.id;
      const { threadId, commentId } = req.params;
      const addedReply = await this._replyService.addReply({
        content: req.body.content,
        owner,
        threadId,
        commentId,
      });
      res.status(201).json({
        status: 'success',
        data: { addedReply },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReply(req, res, next) {
    try {
      const owner = req.auth.credentials.id;
      const { threadId, commentId, replyId } = req.params;
      await this._replyService.deleteReply({
        threadId, commentId, replyId, owner,
      });
      res.status(200).json({ status: 'success' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReplyController;
