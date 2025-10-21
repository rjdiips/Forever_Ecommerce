(The file `c:\Users\Rajdeep\Documents\Visual-Studio\forever-store\README.md` exists, but is empty)

# Forever Store — Fullstack E-commerce

This repository is a fullstack e-commerce template with separate `frontend`, `admin`, and `backend` folders. The frontend is a Vite + React app; the backend is an Express + MongoDB API.

## Live demo

Frontend (deployed on Vercel): https://forever-frontend-one-pearl.vercel.app/

## Quick structure

- `frontend/` — main user-facing React app (Vite)
- `admin/` — admin panel React app
- `backend/` — Express API server, MongoDB, Stripe & Razorpay integration

## Getting started (local)

Prerequisites:

- Node.js (v16+ recommended)
- npm (or yarn)
- MongoDB Atlas or local MongoDB

1. Clone the repo and install dependencies

```powershell
cd C:\Users\Rajdeep\Documents\Visual-Studio\forever-store
cd backend
npm install
cd ..\frontend
npm install
```

2. Environment variables

Create a `.env` in `backend/` (copy from `.env.example` if provided) and set the following variables:

- `ATLASDB_URI` — your MongoDB connection string
- `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET_KEY`, `CLOUDINARY_NAME` — (if using Cloudinary)
- `JWT_SECRET` — JWT signing secret
- `STRIPE_SECRET_KEY` — Stripe secret key (if you use Stripe payments)

Example (backend/.env):

```env
ATLASDB_URI="your-mongodb-uri"
CLOUDINARY_API_KEY=""
CLOUDINARY_SECRET_KEY=""
CLOUDINARY_NAME=""
JWT_SECRET="your_jwt_secret"
STRIPE_SECRET_KEY="sk_test_..."
```

3. Run the backend

```powershell
cd backend
npm start
```

If the port is already in use, either stop the process using that port or set a different port with `PORT` environment variable:

```powershell
$env:PORT=4001
npm start
```

4. Run the frontend

```powershell
cd frontend
npm run dev
```

## Admin panel

Navigate to the `admin/` folder and install/start similarly.

## Deployment

- Frontend is deployed to Vercel: https://forever-frontend-one-pearl.vercel.app/
- Backend can be deployed on Vercel (Serverless functions) or any Node hosting provider. Make sure to set environment variables in the hosting provider.

## Troubleshooting

- Stripe errors complaining about missing keys: ensure `STRIPE_SECRET_KEY` is set in `backend/.env`.
- `EADDRINUSE` on server startup: free the port or set `PORT` before starting (see examples above).

## Contributing

If you plan to extend this project, open issues or submit PRs with clear descriptions and tests where applicable.

## License

MIT
