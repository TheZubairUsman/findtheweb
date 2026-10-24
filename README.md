# FindTheWeb

<p align="center">
  <img src="dist/logo.png" alt="FindTheWeb logo" width="150" />
</p>

<h3 align="center">Discover the best websites, tools, and hidden gems on the internet.</h3>

<p align="center">
  <a href="https://findtheweb.zus3cu.tech">Live website</a> ·
  <a href="https://github.com/TheZubairUsman/findtheweb/issues">Report an issue</a> ·
  <a href="https://github.com/TheZubairUsman/findtheweb">Source code</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-deployment--ready-22c55e?style=flat-square" alt="Deployment ready" />
  <img src="https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb?style=flat-square&logo=react&logoColor=20232a" alt="React and Vite" />
  <img src="https://img.shields.io/badge/backend-Node.js%20%2B%20Express-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js and Express" />
  <img src="https://img.shields.io/badge/license-project--defined-64748b?style=flat-square" alt="Project defined license" />
</p>

![FindTheWeb website demo](docs/findtheweb-demo.gif)

> A quick preview of the real FindTheWeb homepage experience.

## What is FindTheWeb?

FindTheWeb is a curated website-discovery platform for people who want useful tools without wasting time searching through noisy results. It organizes productivity tools, AI services, creative resources, developer utilities, research links, and other internet discoveries into a focused directory.

The project combines a polished static React build with an Express/Sequelize API and an admin-only content workflow.

## Highlights

- Curated discovery across productivity, AI, design, development, research, and business categories
- Search, category browsing, regional filters, tier-based discovery, and bookmarks
- Responsive interface with light/dark mode support
- Editorial journal layout inspired by modern reading platforms, with featured stories and reading-time cues
- API-resilient Products and Blog surfaces that remain useful when optional backend content is unavailable
- Admin dashboard for managing websites, products, categories, and posts
- Express API with JWT-based admin authentication and rate limiting
- SEO-ready metadata, structured data, sitemap, robots rules, and social sharing tags
- GitHub Actions workflow for backend regression tests
- Deployment artifact prepared for Apache/Nginx/Hostinger static hosting

## Technology

| Layer | Technology |
| --- | --- |
| Frontend artifact | React, Vite, JavaScript, CSS |
| Backend | Node.js, Express, Sequelize |
| Data | JSON exports with SQLite-compatible local development |
| Authentication | Server-side admin credentials, bcrypt, JWT |
| Quality | Jest, Supertest, model and API tests |
| Hosting shape | Static `dist/` frontend + persistent Node API |

## Repository layout

```text
.
├── dist/                    # Verified production frontend artifact
├── backend/                 # Express API, models, routes, tests
├── backend/data/            # Curated public content exports
├── docs/                    # Repository media and supporting assets
├── Doc/                     # Product, SEO, legal, and monetization plans
├── .env.example             # Safe configuration template
└── .github/workflows/       # Automated backend test workflow
```

> The original frontend source tree is not included in this snapshot. `dist/` is the verified build artifact currently available for deployment.

## Run locally

### Backend

```powershell
Set-Location backend
Copy-Item .env.example .env
npm ci
npm test -- --runInBand
npm start
```

The API exposes `/health` and `/api/v1/*`. Configure `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`, and database/session values only in the private server environment.

### Frontend preview

Serve the contents of `dist/` with any static HTTP server. For a production-like setup, reverse-proxy `/api/*` to the backend service.

## Production deployment

For `https://findtheweb.zus3cu.tech`:

1. Serve the contents of `dist/` from the subdomain document root.
2. Run `backend/src/index.js` as a persistent Node service on a Node-capable host.
3. Reverse-proxy `/api/*` to the backend port.
4. Set `CLIENT_URL`, `FRONTEND_URL`, and `CORS_ORIGINS` to the HTTPS domain.
5. Configure TLS, backups, process restart, and an uptime check for `/health`.

## Security

- Never commit `.env`, admin passwords, JWT/session secrets, SMTP credentials, database credentials, or source maps.
- Frontend `VITE_*` values are public; secrets belong in the backend environment only.
- The backend requires explicit `ADMIN_EMAIL` and `ADMIN_PASSWORD` for first-admin bootstrap.
- Use unique production credentials and rotate any credential that was previously exposed in local/debug material.

## Verification checklist

- [x] Local frontend smoke-tested in a browser
- [x] Backend health endpoint verified
- [x] Model test suite passes: 15/15
- [x] No tracked `.env`, database, debug files, or source maps
- [x] Production-domain SEO metadata aligned
- [ ] Production backend environment configured
- [ ] HTTPS live verification completed

## Project identity

Built and maintained by **Zubair Usman — ZUS3CU**.

- GitHub: [@TheZubairUsman](https://github.com/TheZubairUsman)
- Live project: [findtheweb.zus3cu.tech](https://findtheweb.zus3cu.tech)

## License

This repository currently uses a project-defined license policy. Contact the maintainer before reusing branding, curated data, or commercial assets.

