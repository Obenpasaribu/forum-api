require('dotenv').config();
const { Pool } = require('pg');

const isTest = process.env.NODE_ENV === 'test';

// If DATABASE_URL is provided (common on Vercel + hosted Postgres providers
// like Neon/Supabase/Railway/RDS), prefer it over discrete PG* vars.
// Hosted providers almost always require SSL, so it's enabled automatically
// whenever a connection string is used, unless explicitly disabled.
const baseConfig = process.env.DATABASE_URL && !isTest
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
    }
  : isTest
    ? {
        host: process.env.PGHOST_TEST,
        port: process.env.PGPORT_TEST,
        user: process.env.PGUSER_TEST,
        password: process.env.PGPASSWORD_TEST,
        database: process.env.PGDATABASE_TEST,
      }
    : {
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
      };

const pool = new Pool(baseConfig);

module.exports = pool;
