# Estada — Real Estate Listing Platform

Estada is a full-stack web app where dealers and owners list properties (houses, plots, flats, commercial) and buyers/renters search, filter, and contact them directly — built for the Pakistani market with verification and trust built into the product.

> **Status:** Phase-1 MVP complete and running locally. See `PROJECT_NOTES.md` for the full build log.

## Features

- **Search & browse** — keyword, price, type, sale/rent, beds/baths, area (marla ↔ sqft) filters; interactive Leaflet map with price pins; list + map dual view; infinite scroll; "search as you move the map"
- **Listings** — photo gallery + lightbox, full spec table, approximate-pin privacy (exact address hidden until you enquire), enquiry form, fraud reporting
- **Accounts** — email/password auth (JWT in httpOnly cookies), shortlist with shareable link, saved searches
- **Dealer tools** — multi-step listing form with draft + client-side image compression, dashboard with status management & view/save/enquiry counts, public dealer profile
- **Trust & real-time** — document verification workflow, admin panel (verifications, report moderation, users), real-time buyer↔dealer chat (Socket.IO; phone numbers hidden until both share), email notifications, 30-day auto-expiry + renewal
- **PKR formatting** throughout (lakh/crore), mobile-first, input validation client + server

> **Dev conveniences:** image uploads fall back to local disk if Cloudinary isn't configured; emails use an Ethereal test inbox (preview URLs printed in the server console) if SMTP isn't set. Add `CLOUDINARY_*` / `SMTP_*` to `server/.env` to use the real services — no code changes.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React (Vite) + TypeScript + Tailwind CSS + Zustand |
| Backend | Node.js + Express + TypeScript |
| Database | MySQL 8 via Prisma ORM |
| Maps | Leaflet + OpenStreetMap + Nominatim geocoding *(free, no API key, no credit card)* |
| Auth | JWT in httpOnly cookies + bcrypt; Google OAuth (later milestone) |
| Images | Cloudinary free tier *(no credit card)* |
| Real-time | Socket.IO (buyer ⇄ dealer chat) |
| Email | Nodemailer (saved-search alerts, enquiry notifications) |

> **Why not Google Maps?** Google Maps/Places/Geocoding requires a billing account with a credit card even on the free tier. Leaflet + OpenStreetMap does everything this app needs for free with no card. The property data model stores plain `lat`/`lng`, so switching to Google later is a component swap, not a rewrite.

---

## Project Structure

```
estada/
├── client/                 # React + Vite frontend
│   ├── public/             # favicon / static assets
│   └── src/
│       ├── assets/         # logo files, images
│       ├── components/     # reusable UI (Button, Card, Navbar, ...)
│       ├── pages/          # full pages (Home, Search, Listing, ...)
│       ├── hooks/          # custom React hooks
│       ├── store/          # Zustand global state
│       └── types/          # shared TypeScript types
└── server/                 # Node + Express backend
    ├── prisma/
    │   ├── schema.prisma   # full database schema (all tables)
    │   └── seed.ts         # sample data (added in Milestone 1)
    └── src/
        ├── config/         # env validation, Prisma client
        ├── routes/         # Express route definitions
        ├── controllers/    # request handlers
        ├── services/       # business logic
        ├── middleware/     # auth, validation, error handling
        └── utils/          # helpers (ApiError, asyncHandler, ...)
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+ and npm
- A running MySQL 8 server (local install is free, no credit card). Note your root password — it goes in `DATABASE_URL`. Prisma will create the `estada` database automatically on first migrate.

### 1. Backend

```bash
cd server
npm install
cp .env.example .env        # then edit .env with your real values
```

Fill in `.env`:
- `DATABASE_URL` — your MySQL connection string, e.g. `mysql://root:PASSWORD@localhost:3306/estada`
- `JWT_SECRET` — a long random string

Create the database tables and generate the Prisma client:

```bash
npm run prisma:generate
npm run prisma:migrate      # creates tables from schema.prisma
npm run db:seed             # loads sample properties + demo accounts (Milestone 1+)
```

Run the API:

```bash
npm run dev                 # http://localhost:5000  (health: /api/health)
```

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env        # defaults are fine for local dev
npm run dev                 # http://localhost:5173
```

The Vite dev server proxies `/api` to the backend on port 5000, so cookies stay same-origin.

---

## Environment Variables

All secrets live in `.env` files (never committed). Templates: `server/.env.example` and `client/.env.example`. Key server vars: `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_*`, `SMTP_*`, `GOOGLE_CLIENT_*`.

---

## Demo Accounts

Loaded by the seed script (`npm run db:seed`):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@estada.app` | `Admin@123` |
| Dealer | `dealer@estada.app` | `Dealer@123` |
| Buyer | `buyer@estada.app` | `Buyer@123` |

The dealer owns all 16 sample listings across Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad and Multan.

---

## Scripts

**Server** (`/server`)
- `npm run dev` — start API with hot reload
- `npm run prisma:migrate` — run DB migrations
- `npm run prisma:studio` — visual DB browser
- `npm run db:seed` — load sample data
- `npm run lint` / `npm run format`

**Client** (`/client`)
- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run lint` / `npm run format`
