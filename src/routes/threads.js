const express = require('express');
const authenticate = require('../middlewares/auth');

module.exports = ({
  threadController, commentController, replyController, commentLikeController,
}) => {
  const router = express.Router();

  // Threads
  router.post('/', authenticate, threadController.postThread);
  router.get('/:threadId', threadController.getThread);

  // Comments
  router.post('/:threadId/comments', authenticate, commentController.postComment);
  router.delete('/:threadId/comments/:commentId', authenticate, commentController.deleteComment);

  // Replies (optional feature)
  router.post('/:threadId/comments/:commentId/replies', authenticate, replyController.postReply);
  router.delete('/:threadId/comments/:commentId/replies/:replyId', authenticate, replyController.deleteReply);

  // Comment likes (optional feature)
  router.put('/:threadId/comments/:commentId/likes', authenticate, commentLikeController.putLike);

  return router;
};
