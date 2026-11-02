# Tour Ceylon Admin, Vendor and Driver Portal

The staff-facing app for the Tour Ceylon / Travel Ready Tours platform. One React app serves three
kinds of signed-in user:

| Role (server) | Portal name | What they get |
|---|---|---|
| `ADMIN` | admin | Bookings, listings, users, vendor and driver approvals, transfers, add-ons, guest reviews, customer notifications |
| `VENDOR` | vendor | Stay vendors work under `/hotel` (rooms, calendar, reservations, policies) |
| `DRIVER` | driver | The mobile-first driver app under `/driver` (inbox, trips, earnings) |

`TOURIST` accounts (customers) are refused here; they use the customer site. The role names are mapped in
one place, `src/app/lib/roles.ts`.

**Some pages show sample data.** Anything labelled **Preview** in the sidebar (dashboards, finance, support,
analytics, activity and audit logs, settings, media, admins) runs on hard-coded sample data, and shows a
banner saying so. The list is `src/app/lib/previewPages.ts`; remove a page from it when you connect it to the
server.

## Stack

Vite 6, React 18, React Router 7, Clerk (sign-in), Tailwind 4. It talks to the FastAPI server in
`tour-ceylon-server` and has no backend of its own.

## Run it locally

You need a current Node.js LTS, a running `tour-ceylon-server`, and a Clerk application.

```bash
npm install
# create .env.local with the variables listed below
npm run dev          # http://localhost:5173
npm run dev:lan      # same, reachable from other devices on your network
```

### Environment variables

Set these in `.env.local` (never commit real keys):

| Variable | Required | Meaning |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | yes | Clerk publishable key. The app refuses to start without it. |
| `VITE_API_URL` | no | API base URL. Defaults to `/api/v1`, which Vite and Vercel forward to the server. Set it to `https://api.<your-domain>` to call the server directly (the server must allow this origin in `ADDITIONAL_CORS_ORIGINS`). |
| `VITE_CUSTOMER_SITE_URL` | no | Customer site address, used for "view on site" links. |

### Dev-only features

These exist only in development builds (`import.meta.env.DEV`) and are removed from production: the
"View as Vendor" toggle, the Developer sidebar group (API Integration, System Architecture, QA Checklist,
Workflows), and the Seasonal Pricing page.

## Build and deploy

```bash
npm run build        # outputs dist/
```

The app is deployed on Vercel. `vercel.json` rewrites `/api/*` to the server and sends every other path to
`index.html` (single-page app).

> **Before going live:** the `/api` rewrite in `vercel.json` currently points at a plain-HTTP IP address
> (SEC-1). Put the server behind HTTPS on a domain (see the VPS section of `tour-ceylon-server/README.md`),
> then change the destination to `https://api.<your-domain>/api/$1`.

## Project layout

```
src/app/
  routes.tsx          every route; the role redirects live in layouts/ProtectedLayout.tsx
  contexts/           AuthContext (Clerk + /users/me), theme
  components/
    api/              typed wrappers around the server (apiClient.ts adds the Clerk token)
    bookings/         bookings list, detail drawer, guide/driver assignment
    listings/         listing review and editor
    hotel/            the stay vendor portal
    transport/        transfer requests, drivers, vehicles
    driver/           the driver app
    admin/            add-ons, guest reviews, customer notifications
    users/, settings/, finance/, support/ ...   (many of these are Preview pages)
  lib/                roles, money, csv, previewPages
  types/              shared booking types
```

## Things to know

- **Client-side role checks are only for the interface.** The server enforces every role. Do not rely on a
  hidden menu item for security.
- **Money** is shown in each booking's own currency (`lib/money.ts`). Totals are never added across currencies.
- **Typechecking:** this project has no `typescript` dependency of its own, so `npx tsc` will not work here.
  Add `typescript` as a dev dependency (or borrow the one in `tour-ceylon-client`) to typecheck. A set of
  type errors from before 2026-11 is known and unfixed.
- The server is the source of truth for the enums used here (inquiry, booking and payment statuses, roles).

## More docs

`docs/` holds the transport and driver specs. `ATTRIBUTIONS.md` and `guidelines/` are from the original design export.
