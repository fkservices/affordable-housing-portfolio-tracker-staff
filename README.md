# Affordable Housing Portfolio Tracker (AHPT) - Staff Dashboard

A compliance monitoring dashboard for the City of Richmond's Affordable Housing Performance Grant (AHPG) program. Built for HCD staff to track property compliance, affordability deadlines, and risk indicators across the portfolio.

## Features

- **Dashboard** - KPI cards, bubble chart by status, alerts feed, upcoming affordability deadlines
- **Properties** - Filterable, sortable table of all properties with status indicators and drill-down to detail views
- **Property Detail** - Full compliance view with milestone tracker, HUD FMR rent comparison, compliance history timeline, staff notes, and risk flags
- **Alerts** - Priority-sorted alert feed with acknowledge/dismiss workflow
- **HUD Reference** - FMR lookup table with AMI-adjusted rent limits for the Richmond MSA
- **Developers** - Developer directory with property counts and compliance rates
- **CSV Export** - Export data from any screen

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Material UI 7 |
| Data | Firebase Firestore |
| Hosting | Firebase App Hosting |
| APIs | HUD FMR API, Legistar API |
| Charts | Recharts, custom SVG |

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Firestore enabled

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
NEXT_PUBLIC_HUD_API_TOKEN=<your-hud-api-token>
NEXT_PUBLIC_FIREBASE_API_KEY=<your-firebase-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-project>.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your-app-id>
```

Register for a free HUD API token at [huduser.gov](https://www.huduser.gov/hudapi/public/register).

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Build

```bash
npm run build
```

## Project Structure

```
src/
  app/                  # Next.js App Router pages
    dashboard/          # Dashboard with KPIs and charts
    properties/         # Properties list and [id] detail
    alerts/             # Alerts feed
    hud-reference/      # HUD FMR reference table
    developers/         # Developer directory
    api/hud-fmr/        # HUD API proxy route
  components/           # Reusable React components
  lib/                  # Firebase config, data service, risk engine, API clients
  data/                 # Seed data JSON files
  utils/                # CSV export, formatters, provenance helpers
scripts/
  seed.ts               # Firestore seeding script
```

## Risk Engine

The risk engine evaluates each property against 8 compliance rules:

| Rule | Amber | Red |
|------|-------|-----|
| Affordability Expiration | < 36 months | < 12 months |
| Rent Drift | > 95% of FMR ceiling | > 100% of FMR ceiling |
| Income Non-Compliance | - | Any unit failing |
| Milestone Delay | > 30 days overdue | > 90 days overdue |
| Reporting Gap | > 30 days late | > 60 days late |
| Tax Delinquency | - | Any delinquency |
| Ownership Change | Any change | - |
| Documentation Gap | < 80% complete | < 60% complete |

## Deployment

Deployed via Firebase App Hosting. Environment variables are managed through Google Cloud Secret Manager and mapped in `apphosting.yaml`.

## Data Sources

- **Tier 1 (HCD-Provided)** - Property records, rent/occupancy reports seeded from XLSX files
- **Tier 2 (Public APIs)** - HUD Fair Market Rents (API), Legistar ordinance records (API)

## Pilot Program

AHPG - City of Richmond, VA

## License

Private - FK Services
