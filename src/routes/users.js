const express = require('express');

module.exports = ({ userController }) => {
  const router = express.Router();
  router.post('/', userController.postUser);
  return router;
};
