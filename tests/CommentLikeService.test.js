const CommentLikeService = require('../src/services/CommentLikeService');

describe('CommentLikeService', () => {
  it('toggles a like after verifying the thread and comment exist', async () => {
    const fakeThreadRepository = { verifyThreadExists: jest.fn().mockResolvedValue() };
    const fakeCommentRepository = { verifyCommentExists: jest.fn().mockResolvedValue() };
    const fakeCommentLikeRepository = { toggleLike: jest.fn().mockResolvedValue() };

    const service = new CommentLikeService(fakeCommentLikeRepository, fakeCommentRepository, fakeThreadRepository);
    await service.toggleLike({ threadId: 'thread-123', commentId: 'comment-123', owner: 'user-123' });

    expect(fakeThreadRepository.verifyThreadExists).toHaveBeenCalledWith('thread-123');
    expect(fakeCommentRepository.verifyCommentExists).toHaveBeenCalledWith('comment-123', 'thread-123');
    expect(fakeCommentLikeRepository.toggleLike).toHaveBeenCalledWith('comment-123', 'user-123');
  });
});
