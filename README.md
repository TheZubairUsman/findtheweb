# FindTheWeb

FindTheWeb is a curated website-discovery platform with a prebuilt React frontend and an Express/Sequelize API.

## Repository layout

- `dist/` — production frontend artifact served by Apache/Nginx/Hostinger
- `backend/` — Node.js API, authentication, content management, and tests
- `backend/data/*.json` — curated public content exports
- `Doc/` — product, SEO, monetization, and legal planning documents

The original source tree for the frontend is not included in this snapshot; `dist/` is the verified build artifact currently available for deployment.

## Security rules

1. Copy `.env.example` files to local/server `.env` files and fill them privately.
2. Never commit `.env`, admin passwords, JWT/session secrets, SMTP credentials, database credentials, or source maps.
3. Frontend `VITE_*` variables are public. Keep JWT secrets and admin credentials in the backend only.
4. The backend refuses to bootstrap the first admin without `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
5. Rotate any credential that was previously stored in an example, debug utility, or shared file.

## Local backend

```powershell
Set-Location backend
Copy-Item .env.example .env
npm ci
npm test -- --runInBand
npm start
```

The API exposes `/health` and `/api/v1/*`. For production, use a managed PostgreSQL database where possible; SQLite is suitable only for a controlled single-instance deployment with reliable backups.

## Deployment shape for `findtheweb.zus3cu.tech`

- Serve the contents of `dist/` at the subdomain document root.
- Run `backend/src/index.js` as a persistent Node service (Hostinger Node/VPS or another Node-capable host).
- Reverse-proxy `/api/*` from the subdomain to the backend port.
- Set `CLIENT_URL`, `FRONTEND_URL`, and `CORS_ORIGINS` to `https://findtheweb.zus3cu.tech`.
- Configure DNS, TLS, process restart, backups, and an uptime check for `/health` before public launch.

## Release checklist

- [ ] `npm test -- --runInBand` passes in `backend/`
- [ ] No tracked secret or source map is present
- [ ] Production environment variables are configured outside GitHub
- [ ] Admin account is created from unique server-side credentials
- [ ] `/`, `/health`, `/api/v1/websites`, login, and SPA routes are smoke-tested
- [ ] DNS/TLS and rollback backup are verified
