const createServer = require('./createServer');

const server = createServer();
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 5000;

server.listen(port, host, () => {
  console.log(`Forum API running at http://${host}:${port}`);
});
