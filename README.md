# Forum API

A REST API for a discussion forum (users, threads, comments, replies, comment
likes) built with **Express** and **PostgreSQL**, matching the criteria in
`Kriteria_Forum_API_Rapi.md` and verified against the provided Postman
collection (`Forum API V2 Test`).

## Stack
- Node.js (LTS v22) + Express (required — no other framework is used)
- PostgreSQL via `pg` + `node-pg-migrate`
- JWT access/refresh tokens (`jsonwebtoken`), `bcrypt` password hashing
- Jest + Supertest for testing

## Project layout
```
config/database.js        pg Pool, switches to *_TEST vars when NODE_ENV=test
migrations/                node-pg-migrate migrations (users, authentications,
                            threads, comments, replies, comment_likes)
src/
  commons/exceptions/      ClientError, InvariantError, NotFoundError,
                            AuthorizationError, AuthenticationError
  utils/                   id (nanoid), password (bcrypt), token (jwt)
  validators/               payload validation per endpoint (Indonesian error
                            messages, matched to the Postman assertions)
  repositories/             raw SQL data access (one per table/aggregate)
  services/                 business logic, orchestrates repositories
  controllers/               HTTP request/response glue
  middlewares/               auth (Bearer access-token check), error handler
  routes/                    Express routers
  container.js               manual dependency-injection wiring
  createServer.js / server.js
tests/                      Jest unit tests (validators + services)
nginx/forumapi.conf         reverse proxy + 90 req/min rate limit on /threads
.github/workflows/          CI (tests on PR) and CD (deploy on push) pipelines
```

## Endpoints
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | /users | – | register |
| POST | /authentications | – | login |
| PUT | /authentications | – | refresh access token |
| DELETE | /authentications | – | logout |
| POST | /threads | Bearer | add thread |
| GET | /threads/:threadId | – | thread detail incl. comments/replies/likeCount |
| POST | /threads/:threadId/comments | Bearer | add comment |
| DELETE | /threads/:threadId/comments/:commentId | Bearer, owner-only | soft-delete |
| POST | /threads/:threadId/comments/:commentId/replies | Bearer | **[optional]** add reply |
| DELETE | .../:replyId | Bearer, owner-only | **[optional]** soft-delete reply |
| PUT | /threads/:threadId/comments/:commentId/likes | Bearer | **[optional]** toggle like/unlike |

## Local setup
```bash
cp .env.example .env      # fill in real DB credentials + JWT secrets
npm install
npm run migrate:up        # applies migrations to PGDATABASE
npm run start:dev
```
Create a second, empty `forumapi_test` database and fill the `*_TEST` env
vars before running tests:
```bash
npm run migrate:test
npm test
```

## Criterion 1 — Continuous Integration
`.github/workflows/continuous-integration.yml` runs on every `pull_request`
to `main`/`master`: it spins up a **PostgreSQL service container**, runs
migrations against it, then runs the Jest suite (unit + integration +
functional tests together). To satisfy "at least one failing and one
passing CI run" on the actual repo:
1. Push this project, open a PR — this is the first (green) run.
2. On a throwaway branch, break a test on purpose (e.g. change an expected
   status code), push, open a second PR — CI goes red — then fix it and
   push again so the PR is mergeable. Both runs stay in the PR's checks
   history for the reviewer to see.

## Deploying to Vercel (optional, for quick testing)
> ⚠️ The submission criteria expect deployment to an **EC2 instance with
> SSH-based CD** (see below) plus an NGINX rate limit in front of the app.
> Vercel is serverless and doesn't run NGINX or a persistent `pm2` process,
> so it can't satisfy criteria 2 and 3 as written. Use it only if you want a
> quick live URL to poke at — for the actual graded submission, deploy to
> EC2 (or another SSH-reachable VM) instead.

This repo includes `api/index.js` + `vercel.json` so it *can* run on Vercel:
1. Provision a hosted Postgres database (Neon, Supabase, Railway, or RDS all
   work) and copy its connection string.
2. In the Vercel project's Settings → Environment Variables, set:
   - `DATABASE_URL` — the connection string from step 1
   - `ACCESS_TOKEN_KEY`, `REFRESH_TOKEN_KEY` — any long random strings
   - `ACCESS_TOKEN_AGE` — e.g. `3000`
3. Run migrations once against that database from your machine:
   ```bash
   DATABASE_URL="postgres://..." npm run migrate:up
   ```
4. Deploy (`vercel --prod` or via the Vercel dashboard/GitHub integration).

## Criterion 2 — Continuous Deployment
`.github/workflows/continuous-deployment.yml` runs on every `push` to
`main`/`master` and SSHes into the EC2 instance (`appleboy/ssh-action`) to
`git pull`, reinstall deps, run migrations and restart the app with `pm2`.
Add these repository secrets before the first push: `SERVER_HOST`,
`SERVER_USERNAME`, `SERVER_SSH_KEY` (private key), `SERVER_PORT` (optional).
On the EC2 instance itself, the one-time setup is:
```bash
sudo apt update && sudo apt install -y nginx postgresql nodejs npm
sudo npm install -g pm2
git clone <your-repo-url> ~/forum-api
cd ~/forum-api && cp .env.example .env   # fill in production values
npm ci --omit=dev
npm run migrate:up
pm2 start src/server.js --name forum-api
pm2 save && pm2 startup
```

## Criterion 3 — Limit Access
`nginx/forumapi.conf` (also committed at the project root as required)
reverse-proxies to the Node app on `127.0.0.1:5000` and applies
`limit_req_zone ... rate=90r/m` scoped to the `/threads` `location` block —
covering `/threads`, `/threads/:id`, `/threads/:id/comments`, replies and
likes, i.e. every path nested under `/threads`.

## Criterion 4 — HTTPS
The NGINX config terminates TLS on port 443 (Let's Encrypt / certbot, or a
`dcdg.xyz` subdomain certificate) and redirects all HTTP traffic to HTTPS.
Once deployed, put the live `https://` URL and the repository link in the
submission's **Student Notes**, and confirm the URL is reachable and passes
the Postman collection before submitting.

## Testing with the provided Postman collection
1. Import `Forum API V2 Test.postman_collection.json` and its environment.
2. Set the environment's `host`/`port`/`protocol` to point at your running
   server (local or the deployed HTTPS URL).
3. Run folders in order with the Collection Runner: Users → Authentications
   → Threads → Comments → [Optional] Replies → [Optional] Likes.
4. If a re-run fails only because of leftover data, truncate the tables with
   `psql` before trying again.

## Submission checklist
- [ ] `node_modules/` removed before zipping
- [ ] `package.json` present at the project root
- [ ] `.env` optionally omitted (variable names match `.env.example`)
- [ ] Repository is public
- [ ] Repo link + HTTPS URL in Student Notes
