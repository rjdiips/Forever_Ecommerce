# Forever E-commerce

Forever E-commerce is a full-stack e-commerce project with separate frontend, admin, and backend services. The frontend is deployed to Vercel.

Live site: https://forever-frontend-one-pearl.vercel.app/

## Repository structure

- `frontend/` - Customer-facing React app (Vite)
- `admin/` - Admin dashboard React app (Vite)
- `backend/` - Express API server (Node.js)

## Quick start (development)

Prerequisites: Node.js (>=16), npm.

1. Frontend (customer)

cd frontend
npm install
npm run dev

2. Admin

cd admin
npm install
npm run dev

3. Backend

cd backend
npm install

# create a .env file with required variables (see below)

npm run server

By default the frontend and admin are Vite apps and will run on the ports Vite chooses (usually 5173). The backend runs on the port configured inside your server (check `backend/server.js`), and is started with `npm run server` (uses nodemon).

## Environment variables (backend)

The backend uses several environment variables. Create a `.env` (or `.env.local`) in `backend/` with at least the following keys:

- ATLASDB_URI (MongoDB connection URI)
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- STRIPE_SECRET_KEY
- (other keys may be used for SendGrid, JWT secrets, Razorpay, etc. Check `backend/` source for missing keys)

Example `.env` (do NOT commit secrets):

ATLASDB_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
STRIPE_SECRET_KEY=...

## Scripts

- Frontend and Admin (Vite): `npm run dev`, `npm run build`, `npm run preview`
- Backend: `npm run start` (node server.js), `npm run server` (nodemon)

## Deployment

The frontend is deployed to Vercel at: https://forever-frontend-one-pearl.vercel.app/

If you plan to deploy the backend, provide the same environment variables in your host's dashboard (e.g., Render, Heroku, Vercel Serverless functions, or DigitalOcean).
