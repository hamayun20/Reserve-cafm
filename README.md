# Reserve CAFM

A deployable Computer Aided Facility Management application for enterprise facility teams.

## Modules

- Portfolio, sites, buildings, floors and spaces
- Asset registry with lifecycle, criticality, warranty and cost fields
- Service requests, helpdesk triage, SLAs and priorities
- Work orders, preventive maintenance, job plans and technician assignment
- Inspections, permits, HSE incidents and compliance tasks
- Inventory, spare parts, purchase requests, vendors and contracts
- Energy meters, IoT alerts, dashboards, KPIs and reports
- Role-aware operating cockpit for management, helpdesk, supervisors and technicians

## Local setup

```bash
npm install
copy .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

## Dokploy

This project is ready for Dokploy as an independent app.

Recommended Dokploy setup:

- Build type: Dockerfile, or Docker Compose if you want the bundled PostgreSQL service.
- Dockerfile path: `dockerfile` (lowercase, matching the Dokploy build setting).
- Dockerfile port: 3003.
- Required persistent database variable when using external PostgreSQL: DATABASE_URL.
- App name variable: NEXT_PUBLIC_APP_NAME=Reserve CAFM.

The included docker-compose.yml runs the app and a dedicated PostgreSQL database using the reserve_cafm_postgres Docker volume. If DATABASE_URL is not set, the container still starts in demo mode with fallback data.

## Mobile apps

Android and iOS Capacitor project files are included for testing the web app as a mobile application. See [MOBILE.md](MOBILE.md) for setup, build, and testing steps.
