# lld-practice-platform-fe

Frontend for the LLD Lab learning platform — React + Vite single-page app.

## Setup

```bash
npm install
npm run dev
```

Dev server runs on `http://localhost:5173` and proxies `/api` to the backend at `http://localhost:4000`. Start the backend first (`npm run dev` in `lld-practice-platform-be`).

## Auth

The app uses cookie sessions set by the backend (`api.js` sends `credentials: 'include'` on every request, which is transparent through the Vite proxy in dev).

- Public pages: `/login` and `/signup`.
- All other routes are wrapped in `RequireAuth`; unauthenticated visitors are redirected to `/login`.
- The session is restored on load via `GET /api/auth/me` (see `src/context/AuthContext.jsx`).
- The header account menu and sidebar footer show the real user and provide log out.

Demo login (from the seed): `demo@lld.dev` / `demo1234`.

## Scripts

```bash
npm run dev      # start dev server (http://localhost:5173)
npm run build    # production build to dist/
npm run lint     # eslint
npm run preview  # preview the production build
```

In production the app should be served from a URL whose origin matches the backend's `CORS_ORIGIN` allow list (see backend README).