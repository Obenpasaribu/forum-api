// Vercel serverless entrypoint. Vercel treats any file under /api that
// exports a request handler as a function; Express apps work directly here
// since `app` itself is a valid (req, res) handler.
const createServer = require('../src/createServer');

const app = createServer();

module.exports = app;
