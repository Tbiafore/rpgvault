# The RPG Vault

A comprehensive community-driven platform for tabletop RPG adventure enthusiasts, offering advanced discovery, review, and interaction tools across multiple game systems.

## Features

- **166+ RPG Adventures** across 18 game systems
- **Review System** with Bayesian ratings
- **Community Forums** with 5 discussion categories
- **Advanced Search & Filtering** by genre, system, publisher
- **User Authentication** with admin features
- **Featured Content** system for highlighting top adventures

## Tech Stack

- **Frontend**: React 18 + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + Passport.js
- **Database**: PostgreSQL + Drizzle ORM
- **Build**: Vite + esbuild

## Quick Start

```bash
npm install
npm run dev
```

## Deployment

See `DEPLOYMENT_GUIDE.md` for complete hosting setup instructions.

## Database

The app uses PostgreSQL with automatic schema management via Drizzle ORM. Set `DATABASE_URL` environment variable to connect.

## Environment Variables

Required for production:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secure session key
- `NODE_ENV=production`
- `SENDGRID_API_KEY` - For email features (optional)
