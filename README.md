# ZUNO React — Permanent Prototype

This repository is intentionally separate from **Zuno-Working**.

## Purpose

This is the clean React foundation for a permanent ZUNO prototype. The application does not depend on an AI service to operate.

## Current architecture

- React 19 + TypeScript
- Vite
- Strict TypeScript
- Persistent browser data layer using localStorage
- Explicit customer/helper/admin identities
- Relational booking IDs: `booking.customerId` and `booking.helperId`
- No first-helper fallback
- No name-based booking identity
- Helper actions are checked against the authenticated helper ID
- Customer booking visibility is checked against the authenticated customer ID

## Truth-mode design

A booking is never identified by a display name.

Example:

```
booking.id         -> book_...
booking.customerId -> cust_...
booking.helperId   -> hlp_kavitha
```

The UI resolves names from those IDs.

## Important prototype boundary

This version is a permanent **frontend prototype**, not yet a production cloud backend. localStorage gives persistence across browser refreshes on the same device, but production deployment should replace the local data layer with an API and PostgreSQL (or equivalent) before handling real customer data.

## Run

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```

## Repository separation

- **Zuno-Working** remains the existing application and is not modified by this repository.
- **Zuno-React** contains the new permanent React prototype.
