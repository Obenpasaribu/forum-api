require('dotenv').config();
const express = require('express');
const cors = require('cors');

const container = require('./container');
const usersRoutes = require('./routes/users');
const authenticationsRoutes = require('./routes/authentications');
const threadsRoutes = require('./routes/threads');
const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFoundHandler');

const createServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Forum API is up' });
  });

  app.use('/users', usersRoutes(container));
  app.use('/authentications', authenticationsRoutes(container));
  app.use('/threads', threadsRoutes(container));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

module.exports = createServer;
