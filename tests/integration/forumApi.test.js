const request = require('supertest');
const pool = require('../../config/database');
const createServer = require('../../src/createServer');

const app = createServer();

const truncateAll = () => pool.query(
  'TRUNCATE comment_likes, replies, comments, threads, authentications, users RESTART IDENTITY CASCADE'
);

const register = async (username) => {
  await request(app).post('/users').send({ username, password: 'secret', fullname: `Full ${username}` });
  const res = await request(app).post('/authentications').send({ username, password: 'secret' });
  return res.body.data;
};

describe('Forum API (integration / functional)', () => {
  beforeAll(truncateAll);
  afterAll(async () => {
    await truncateAll();
    await pool.end();
  });

  let alice; let bob; let threadId; let commentId; let replyId;

  it('registers users and rejects duplicates', async () => {
    const ok = await request(app).post('/users').send({ username: 'alice', password: 'secret', fullname: 'Alice' });
    expect(ok.status).toBe(201);
    expect(ok.body.data.addedUser.username).toBe('alice');

    const dup = await request(app).post('/users').send({ username: 'alice', password: 'secret', fullname: 'Alice' });
    expect(dup.status).toBe(400);
  });

  it('logs in and refreshes the access token', async () => {
    alice = await register('alice');
    bob = await register('bob');
    expect(alice.accessToken).toBeDefined();

    const refreshed = await request(app).put('/authentications').send({ refreshToken: alice.refreshToken });
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.data.accessToken).toBeDefined();
  });

  it('rejects unauthenticated thread creation with 401', async () => {
    const res = await request(app).post('/threads').send({ title: 't', body: 'b' });
    expect(res.status).toBe(401);
  });

  it('creates a thread, comment, reply and like', async () => {
    const t = await request(app).post('/threads').set('Authorization', `Bearer ${alice.accessToken}`)
      .send({ title: 'judul', body: 'isi' });
    expect(t.status).toBe(201);
    threadId = t.body.data.addedThread.id;

    const c = await request(app).post(`/threads/${threadId}/comments`)
      .set('Authorization', `Bearer ${alice.accessToken}`).send({ content: 'komentar' });
    expect(c.status).toBe(201);
    commentId = c.body.data.addedComment.id;

    const r = await request(app).post(`/threads/${threadId}/comments/${commentId}/replies`)
      .set('Authorization', `Bearer ${bob.accessToken}`).send({ content: 'balasan' });
    expect(r.status).toBe(201);
    replyId = r.body.data.addedReply.id;

    const l = await request(app).put(`/threads/${threadId}/comments/${commentId}/likes`)
      .set('Authorization', `Bearer ${bob.accessToken}`);
    expect(l.status).toBe(200);
  });

  it('returns the full thread detail', async () => {
    const res = await request(app).get(`/threads/${threadId}`);
    expect(res.status).toBe(200);
    const { thread } = res.body.data;
    expect(thread.username).toBe('alice');
    expect(thread.comments[0].likeCount).toBe(1);
    expect(thread.comments[0].replies[0].content).toBe('balasan');
  });

  it('returns 404 for an unknown thread', async () => {
    const res = await request(app).get('/threads/thread-unknown');
    expect(res.status).toBe(404);
  });

  it('forbids deleting someone else\'s comment (403) and reply (403)', async () => {
    const c = await request(app).delete(`/threads/${threadId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${bob.accessToken}`);
    expect(c.status).toBe(403);

    const r = await request(app).delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
      .set('Authorization', `Bearer ${alice.accessToken}`);
    expect(r.status).toBe(403);
  });

  it('rejects a comment id that does not belong to the thread', async () => {
    const other = await request(app).post('/threads').set('Authorization', `Bearer ${alice.accessToken}`)
      .send({ title: 'lain', body: 'lain' });
    const res = await request(app).delete(`/threads/${other.body.data.addedThread.id}/comments/${commentId}`)
      .set('Authorization', `Bearer ${alice.accessToken}`);
    expect(res.status).toBe(404);
  });

  it('soft-deletes comment and reply', async () => {
    const r = await request(app).delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
      .set('Authorization', `Bearer ${bob.accessToken}`);
    expect(r.status).toBe(200);
    const c = await request(app).delete(`/threads/${threadId}/comments/${commentId}`)
      .set('Authorization', `Bearer ${alice.accessToken}`);
    expect(c.status).toBe(200);

    const res = await request(app).get(`/threads/${threadId}`);
    expect(res.body.data.thread.comments[0].content).toBe('**komentar telah dihapus**');
    expect(res.body.data.thread.comments[0].replies[0].content).toBe('**balasan telah dihapus**');
  });

  it('returns 400 (not 500) for malformed JSON', async () => {
    const res = await request(app).post('/users').set('Content-Type', 'application/json').send('{bad');
    expect(res.status).toBe(400);
  });
});
