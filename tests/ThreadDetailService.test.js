const ThreadDetailService = require('../src/services/ThreadDetailService');

describe('ThreadDetailService', () => {
  it('replaces deleted comment/reply content and includes like counts', async () => {
    const fakeThreadRepository = {
      getThreadById: jest.fn().mockResolvedValue({
        id: 'thread-123', title: 'a thread', body: 'a body', date: '2021-08-13', username: 'dicoding',
      }),
    };
    const fakeCommentRepository = {
      getCommentsByThreadId: jest.fn().mockResolvedValue([
        {
          id: 'comment-1', username: 'dicoding', date: '2021-08-13', content: 'a comment', is_delete: false,
        },
        {
          id: 'comment-2', username: 'johndoe', date: '2021-08-13', content: 'deleted content', is_delete: true,
        },
      ]),
    };
    const fakeReplyRepository = {
      getRepliesByCommentId: jest.fn().mockResolvedValue([]),
    };
    const fakeCommentLikeRepository = {
      getLikeCountsByCommentIds: jest.fn().mockResolvedValue({ 'comment-1': 2 }),
    };

    const service = new ThreadDetailService(
      fakeThreadRepository, fakeCommentRepository, fakeReplyRepository, fakeCommentLikeRepository
    );
    const thread = await service.getThreadDetail('thread-123');

    expect(thread.comments[0].content).toEqual('a comment');
    expect(thread.comments[0].likeCount).toEqual(2);
    expect(thread.comments[1].content).toEqual('**komentar telah dihapus**');
    expect(thread.comments[1].likeCount).toEqual(0);
  });
});
