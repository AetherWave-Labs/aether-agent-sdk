# Aether Agent Frontend

Next.js operations UI for managing autonomous blockchain agents.

## Pages

- **Dashboard** (`/`) - Agent overview, statistics
- **Transactions** (`/transactions`) - Transaction explorer with status tracking
- **Policies** (`/policies`) - Agent policy configuration and creation
- **Audit** (`/audit`) - Audit event log

## Setup

```bash
npm install
npm run dev
```

The frontend connects to the backend API at `http://localhost:3001` by default.

## Configuration

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_KEY=dev-key-123
```

## Features

- Real-time transaction status tracking
- Policy configuration UI
- Agent management
- Audit log visualization
- Responsive design with Tailwind CSS

## Architecture

```
Frontend (Next.js)
    ↓ API calls
Backend (Express)
    ↓ SDK calls
Aether Agent SDK
    ↓ Chain adapters
Stellar / EVM Networks
```

The frontend never handles private keys. All signing and sensitive operations happen in the backend.
