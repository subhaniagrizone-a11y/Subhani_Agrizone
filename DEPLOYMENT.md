# cPanel Passenger Deployment

This document deploys the existing Next.js application to Spaceship Web Hosting Pro using cPanel Node.js Application / Passenger. It does not change DNS or the existing production domain.

## Application settings

- Node.js version: `24.x` (the hosting server may show `24.20.0`)
- Application mode: `Production`
- Git clone path: `repositories/Subhani_Agrizone`
- cPanel application root: choose the application directory configured in cPanel (for example, `subhni-app`)
- Startup file: `server.js`
- Temporary test URL: `https://test.subhaniagrizone.com`
- Main domain: leave `https://subhaniagrizone.com` unchanged during testing

In cPanel, create the Node.js application with the settings above and point its application root at the directory containing the cloned project files. The Git clone directory and the cPanel application root do not need to be the same directory. Passenger supplies `PORT`; `server.js` binds the existing Next.js application to `0.0.0.0` and does not use a fixed production port.

## Upload and build

1. Clone or upload the repository into `repositories/Subhani_Agrizone`. Do not upload `.env`, `.env.local`, or any file containing credentials.
2. Configure the cPanel Node.js application's application root to the cloned project directory, or to a separately copied project directory containing the same files.
3. In the configured application root, install dependencies:

   ```bash
   npm install
   npm run prisma:generate
   npm run build
   ```

4. Set the cPanel Node.js application startup file to `server.js` and restart the application.

`npm run prisma:generate` only generates Prisma Client. Do not run `prisma migrate reset`, database-clearing scripts, or the seed script against production. The application uses MongoDB and does not use Prisma SQL migrations.

## Environment variables

Set these in the cPanel application environment. Use `.env.example` as the complete name-only reference, and provide real values only in cPanel or another secure secret store.

Required for production startup:

- `MONGODB_URI` (MongoDB connection string; `DATABASE_URL` is accepted as a compatibility fallback)
- `AUTH_SECRET` or `NEXTAUTH_SECRET` (a long random secret)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_SITE_URL=https://test.subhaniagrizone.com`

Set these when the related feature is enabled:

- Google sign-in: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and the provider callback URL for the test domain
- Email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` or the supported app-password variable, `SMTP_FROM`, `SMTP_SECURE`
- WhatsApp notifications: `WHATSAPP_API_URL`, `WHATSAPP_API_TOKEN`, `WHATSAPP_SENDER`
- Support chat: `OPENAI_API_KEY`, `OPENAI_MODEL`
- Weather: `WEATHER_API_KEY`
- Payment webhooks: `PAYMENT_WEBHOOK_SECRET`, `JAZZCASH_WEBHOOK_SECRET`, `EASYPAISA_WEBHOOK_SECRET`, `CARD_WEBHOOK_SECRET`
- SMTP debug endpoint protection: `DEBUG_SMTP_KEY`

The remaining public phone, WhatsApp, checkout-tax, MongoDB tuning, admin guard, and notification email variables are also listed in `.env.example`. Keep `NODE_ENV=production`; Passenger supplies `PORT`.

## Restarting the application

Use the cPanel Node.js application manager and click **Restart** after changing code or environment variables. A restart is required after each new build.

## Logs and troubleshooting

- Review the application log available from the cPanel Node.js application manager or Passenger error log.
- A missing `MONGODB_URI`/`DATABASE_URL` or auth secret is reported by `server.js` without printing secret values.
- If the app starts but database operations fail, verify the MongoDB connection string, database user permissions, and MongoDB network allowlist.
- If OAuth fails, verify the callback URL uses the test hostname and HTTPS.
- If the build fails, run `npm run typecheck` and `npm run build` in the application root and inspect the first error.

## Verification

After Passenger reports the application as running, verify:

- `https://test.subhaniagrizone.com`
- A normal product page and API request
- Login and admin access
- Cart and checkout flows
- A non-destructive database-backed read

Do not switch or modify `https://subhaniagrizone.com` until the test hostname has been fully verified. Do not change nameservers, A records, CNAME records, or any other DNS configuration as part of this deployment.
