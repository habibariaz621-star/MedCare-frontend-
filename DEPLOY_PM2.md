# MedCare Frontend — PM2 Deploy (AWS EC2)

## 1. Environment file

On the server, in the `medcare-frontend` folder:

```bash
cp .env.example .env
nano .env
```

Example (same EC2, backend on port 5000):

```env
PORT=3000
NEXT_PUBLIC_API_URL=http://13.229.74.185:5000/api
NEXT_PUBLIC_USE_MOCK_AUTH=false
```

> `NEXT_PUBLIC_*` values are embedded at **build time**. After changing `.env`, run `npm run pm2:restart`.

Also set **backend** `.env` on the same server:

```env
FRONTEND_URL=http://13.229.74.185:3000
```

Then: `pm2 restart medcare-api --update-env`

---

## 2. EC2 setup (Ubuntu)

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2
sudo npm install -g pm2

# Project
git clone YOUR_REPO_URL medcare-frontend
cd medcare-frontend
npm install
```

Create `.env` (see step 1). Do **not** commit `.env` to git.

---

## 3. Build and start with PM2

```bash
npm run pm2:start
```

This runs `next build` then starts `medcare-web` on port `3000`.

---

## 4. AWS Security Group

| Type       | Port | Source    | App        |
|------------|------|-----------|------------|
| Custom TCP | 3000 | 0.0.0.0/0 | Frontend   |
| Custom TCP | 5000 | 0.0.0.0/0 | Backend API |

Open in browser: `http://YOUR_SERVER_IP:3000`

---

## 5. Auto-start on reboot

```bash
pm2 save
pm2 startup
# run the command PM2 prints (sudo env PATH=...)
```

---

## 6. After code or env changes

```bash
git pull
npm install
npm run pm2:restart
```

---

## Useful PM2 commands

| Command | Purpose |
|---------|---------|
| `pm2 status` | List apps (`medcare-web`, `medcare-api`) |
| `pm2 logs medcare-web` | Frontend logs |
| `pm2 restart medcare-web` | Restart frontend |
| `npm run pm2:stop` | Stop frontend |
| `npm run pm2:delete` | Remove from PM2 |

---

## Both apps on one server

```bash
# Backend (folder: medcare-backend)
cd ../medcare-backend
npm run pm2:start

# Frontend (folder: medcare-frontend)
cd ../medcare-frontend
npm run pm2:start

pm2 status
```

---

## Optional: Nginx reverse proxy

For a domain without `:3000` / `:5000` in the URL, put Nginx in front:

- `https://yourdomain.com` → `http://127.0.0.1:3000`
- `https://yourdomain.com/api` → `http://127.0.0.1:5000/api`

Update `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` to use `https://yourdomain.com`.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Cannot connect to backend" | Check `http://IP:5000/api/health`, Security Group port 5000, `NEXT_PUBLIC_API_URL` (single `/api`, no `//api`) |
| CORS errors | Backend `FRONTEND_URL` must match frontend URL exactly |
| Old API URL after change | `npm run pm2:restart` (rebuild required for `NEXT_PUBLIC_*`) |
| Login works locally, not on EC2 | Atlas Network Access must allow **EC2 public IP** |
