const CommentService = require('../src/services/CommentService');

describe('CommentService', () => {
  it('verifies the thread exists before adding a comment', async () => {
    const fakeThreadRepository = { verifyThreadExists: jest.fn().mockResolvedValue() };
    const fakeCommentRepository = {
      addComment: jest.fn().mockResolvedValue({ id: 'comment-123', content: 'a comment', owner: 'user-123' }),
    };

    const commentService = new CommentService(fakeCommentRepository, fakeThreadRepository);
    const result = await commentService.addComment({ content: 'a comment', owner: 'user-123', threadId: 'thread-123' });

    expect(fakeThreadRepository.verifyThreadExists).toHaveBeenCalledWith('thread-123');
    expect(result).toEqual({ id: 'comment-123', content: 'a comment', owner: 'user-123' });
  });

  it('only allows the owner to delete their own comment', async () => {
    const fakeThreadRepository = { verifyThreadExists: jest.fn().mockResolvedValue() };
    const fakeCommentRepository = {
      verifyCommentExists: jest.fn().mockResolvedValue(),
      verifyCommentOwner: jest.fn().mockResolvedValue(),
      deleteComment: jest.fn().mockResolvedValue(),
    };

    const commentService = new CommentService(fakeCommentRepository, fakeThreadRepository);
    await commentService.deleteComment({ threadId: 'thread-123', commentId: 'comment-123', owner: 'user-123' });

    expect(fakeCommentRepository.verifyCommentOwner).toHaveBeenCalledWith('comment-123', 'user-123');
    expect(fakeCommentRepository.deleteComment).toHaveBeenCalledWith('comment-123');
  });
});
