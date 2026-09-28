const pool = require('../config/database');

// Repositories
const UserRepository = require('./repositories/UserRepository');
const AuthenticationRepository = require('./repositories/AuthenticationRepository');
const ThreadRepository = require('./repositories/ThreadRepository');
const CommentRepository = require('./repositories/CommentRepository');
const ReplyRepository = require('./repositories/ReplyRepository');
const CommentLikeRepository = require('./repositories/CommentLikeRepository');

// Services
const UserService = require('./services/UserService');
const AuthenticationService = require('./services/AuthenticationService');
const ThreadService = require('./services/ThreadService');
const CommentService = require('./services/CommentService');
const ReplyService = require('./services/ReplyService');
const CommentLikeService = require('./services/CommentLikeService');
const ThreadDetailService = require('./services/ThreadDetailService');

// Controllers
const UserController = require('./controllers/UserController');
const AuthenticationController = require('./controllers/AuthenticationController');
const ThreadController = require('./controllers/ThreadController');
const CommentController = require('./controllers/CommentController');
const ReplyController = require('./controllers/ReplyController');
const CommentLikeController = require('./controllers/CommentLikeController');

const userRepository = new UserRepository(pool);
const authenticationRepository = new AuthenticationRepository(pool);
const threadRepository = new ThreadRepository(pool);
const commentRepository = new CommentRepository(pool);
const replyRepository = new ReplyRepository(pool);
const commentLikeRepository = new CommentLikeRepository(pool);

const userService = new UserService(userRepository);
const authenticationService = new AuthenticationService(userRepository, authenticationRepository);
const threadService = new ThreadService(threadRepository);
const commentService = new CommentService(commentRepository, threadRepository);
const replyService = new ReplyService(replyRepository, commentRepository, threadRepository);
const commentLikeService = new CommentLikeService(commentLikeRepository, commentRepository, threadRepository);
const threadDetailService = new ThreadDetailService(
  threadRepository,
  commentRepository,
  replyRepository,
  commentLikeRepository
);

const userController = new UserController(userService);
const authenticationController = new AuthenticationController(authenticationService);
const threadController = new ThreadController(threadService, threadDetailService);
const commentController = new CommentController(commentService);
const replyController = new ReplyController(replyService);
const commentLikeController = new CommentLikeController(commentLikeService);

module.exports = {
  pool,
  userController,
  authenticationController,
  threadController,
  commentController,
  replyController,
  commentLikeController,
};
