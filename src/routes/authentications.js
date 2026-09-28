const express = require('express');

module.exports = ({ authenticationController }) => {
  const router = express.Router();
  router.post('/', authenticationController.postAuthentication);
  router.put('/', authenticationController.putAuthentication);
  router.delete('/', authenticationController.deleteAuthentication);
  return router;
};
