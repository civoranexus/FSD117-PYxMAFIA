# Frontend (React + Vite)

This is the React frontend for the project.

For the full project documentation (setup, env vars, backend routes, folder structure), see the root README:

- `../README.md`

## Local Development

```bash
npm install
npm run dev
```

### API

The frontend calls the backend via `/api` (Vite dev proxy is configured).

If you want to hit a remote backend, set:

```bash
VITE_API_BASE_URL=https://your-backend-domain.com/api
```
