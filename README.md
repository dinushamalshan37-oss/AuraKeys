# AuraKeys

A digital marketplace for game keys built with Next.js App Router, TypeScript, MongoDB/Mongoose, NextAuth, Stripe Checkout, and Cloudinary.

## Requirements

- Node.js 20 or newer
- MongoDB configured as a replica set (MongoDB transactions are used for reservations, payment fulfillment, and inventory updates)
- Stripe account and webhook endpoint
- Cloudinary account for admin image uploads

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set the required values.
3. Start the development server with `npm run dev`.
4. Sign in with an email listed in `ADMIN_EMAILS` to access `/admin`.

`MONGODB_URI`, `NEXTAUTH_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `LICENSE_KEY_ENCRYPTION_KEY` are required for the corresponding services. Generate the license encryption key with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` and keep it backed up: losing it makes stored keys unrecoverable. Google sign-in is enabled when both Google OAuth values and MongoDB are configured. `ADMIN_EMAILS` is a comma-separated allowlist; new accounts cannot assign themselves an administrator role.

For a local MongoDB instance, start it as a single-node replica set (for example, with replica set name `rs0`) and include `?replicaSet=rs0` in the URI. A standalone MongoDB server will not support the multi-document transactions required for safe key delivery.

## Stripe webhook

Configure a Stripe webhook to send events to `https://<your-domain>/api/webhook/stripe` (locally, use the Stripe CLI forwarder). Subscribe to:

- `checkout.session.completed`
- `checkout.session.expired`

Set the endpoint signing secret as `STRIPE_WEBHOOK_SECRET`. Checkout reserves specific keys for 30 minutes. Successful payment marks those keys sold, decrements product stock, and saves the delivered keys atomically. Expired sessions release reservations.

## Admin operations

- Create and edit catalog products at `/admin`.
- Upload product images as JPEG, PNG, or WebP (maximum 8 MB); Cloudinary credentials are required.
- Paste activation keys one per line to add inventory. Duplicate keys reject the transaction rather than partially changing stock.
- License keys are encrypted with AES-256-GCM in the database; the encryption key is never stored alongside inventory.
- Add the initial product catalog and keys through the admin panel; the application intentionally does not seed mock products or license keys.

## Commands

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — production server
- `npm run typecheck` — TypeScript validation
