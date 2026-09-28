# Panduan Deploy Ulang (EC2 + Nginx + CI/CD)

## A. Siapkan repo GitHub (public)
```bash
git init && git add . && git commit -m "feat: forum api"
git branch -M main
git remote add origin https://github.com/<user>/forum-api.git
git push -u origin main
```
> `.env` dan `node_modules` sudah di-.gitignore. Jangan pernah commit `.env`.

## B. Siapkan server (EC2 Ubuntu 22.04/24.04)
Security group: buka port 22 (SSH), 80, 443. Jangan buka 5000 & 5432 ke publik.
```bash
sudo apt update && sudo apt install -y nginx postgresql git certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs
sudo npm i -g pm2

# database
sudo -u postgres psql -c "CREATE USER developer WITH PASSWORD 'GANTI_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE forumapi OWNER developer;"

# aplikasi
git clone https://github.com/<user>/forum-api.git ~/forum-api
cd ~/forum-api && cp .env.example .env && nano .env
#   HOST=127.0.0.1  PORT=5000  NODE_ENV=production
#   PGHOST=localhost PGUSER=developer PGPASSWORD=GANTI_PASSWORD PGDATABASE=forumapi
#   ACCESS_TOKEN_KEY / REFRESH_TOKEN_KEY = string acak panjang (openssl rand -hex 32)
npm ci --omit=dev
npm run migrate:up
pm2 start src/server.js --name forum-api && pm2 save && pm2 startup   # jalankan perintah yang dicetak
curl http://127.0.0.1:5000/        # harus: {"status":"success",...}
```
Repo public → `git clone` via HTTPS tidak butuh kredensial, jadi `git pull` di CD akan berjalan.

## C. Nginx + HTTPS + limit access
Arahkan domain/subdomain (A record) ke IP publik EC2 dulu.
```bash
cd ~/forum-api
sudo cp nginx/forumapi.conf /etc/nginx/sites-available/forumapi
sudo sed -i 's/YOUR_DOMAIN_HERE/domainmu.com/g' /etc/nginx/sites-available/forumapi
sudo ln -s /etc/nginx/sites-available/forumapi /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d domainmu.com        # pilih redirect HTTP -> HTTPS
```
Uji limit (harus muncul kode 429):
```bash
for i in $(seq 1 150); do curl -s -o /dev/null -w "%{http_code}\n" https://domainmu.com/threads/x; done | sort | uniq -c
```
Tunggu ±1 menit sebelum menjalankan Postman agar limit reset.

## D. Secrets untuk CD
GitHub → Settings → Secrets and variables → Actions → New repository secret:
- `SERVER_HOST` = IP publik / domain EC2
- `SERVER_USERNAME` = `ubuntu`
- `SERVER_SSH_KEY` = isi lengkap file `.pem` (termasuk baris BEGIN/END)
- `SERVER_PORT` = 22 (opsional)

## E. Membuat log CI (1 gagal + 1 sukses) — WAJIB
```bash
git checkout -b test/ci-fail
# rusak 1 tes, mis. ubah expect(res.status).toBe(201) -> 200 di tests/integration/forumApi.test.js
git commit -am "test: sengaja gagal" && git push -u origin test/ci-fail
```
Buka Pull Request ke `main` → tunggu run merah di tab Actions. Lalu perbaiki:
```bash
git revert HEAD --no-edit && git push
```
Run hijau muncul di PR yang sama. Setelah itu **Merge** PR → ini memicu Continuous Deployment.
Pastikan run "Continuous Deployment" hijau. Jangan hapus PR/branch/riwayat Actions.

## F. Verifikasi akhir sebelum submit
1. Kosongkan data uji: `sudo -u postgres psql forumapi -c "TRUNCATE comment_likes, replies, comments, threads, authentications, users CASCADE;"`
2. Jalankan Postman Collection + Environment ke `https://domainmu.com` (protocol https, tanpa port).
3. Semua request harus hijau. Kalau ada yang merah: `pm2 logs forum-api`.
4. Submit: link repo + URL HTTPS di Student Notes.
