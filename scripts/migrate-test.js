// Runs migrations against the *_TEST database (node-pg-migrate only reads PG*/DATABASE_URL).
require('dotenv').config();
const { spawnSync } = require('child_process');

const {
  PGUSER_TEST: user, PGPASSWORD_TEST: password, PGHOST_TEST: host,
  PGPORT_TEST: port = 5432, PGDATABASE_TEST: database,
} = process.env;

const url = `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
const result = spawnSync('npx', ['node-pg-migrate', ...(process.argv.slice(2).length ? process.argv.slice(2) : ['up'])], {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: url },
});
process.exit(result.status);
