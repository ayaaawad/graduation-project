# NextGen Tech-Store

Full-stack BI-ready Next.js starter for a graduation project focused on store analytics, AI product matching, and an admin-oriented operations dashboard.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- MongoDB

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set `MONGODB_URI`.
3. Seed the database with `npm run seed`.
4. Run the app with `npm run dev`.

If MongoDB is not configured yet, `/api/products` will return the same 15-product seed payload so you can still verify the JSON structure and fields.

## Day 2 Data Model

- Product schema fields include brand, model name, category, price, stock, condition, display specs, storage, battery, GPU, and AI feature vectors.
- The `/api/products` route returns all seeded products as JSON for verification.
- The seed script creates 15 products across gaming, ultrabook, and budget/student segments.

## Notes

- The UI is intentionally dark, sleek, and BI-oriented.
- The landing page avoids revenue-prediction wording and focuses on store intelligence and product matching.