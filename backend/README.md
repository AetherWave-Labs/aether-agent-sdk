# Aether Agent Backend

Express.js API server for the Aether Agent SDK. Orchestrates agent execution, policy enforcement, transaction lifecycle, and audit logging.

## Architecture

```
┌─────────────────────────────────────────┐
│              Express Server             │
├─────────────────────────────────────────┤
│  Middleware                              │
│  ├── Auth (API Key / JWT)              │
│  ├── Rate Limiting                      │
│  ├── CORS + Helmet                      │
│  └── Error Handler                      │
├─────────────────────────────────────────┤
│  Routes                                 │
│  ├── /api/agents     - Agent CRUD      │
│  ├── /api/payments   - Payment exec    │
│  ├── /api/transactions - TX status     │
│  └── /api/audit      - Audit log       │
├─────────────────────────────────────────┤
│  Services                               │
│  ├── PolicyEngine    - Policy checks   │
│  ├── TransactionExecutor - TX flow     │
│  └── AuditLogger     - Event logging   │
├─────────────────────────────────────────┤
│  SDK Adapters                            │
│  ├── StellarAdapter  - Stellar chain   │
│  └── EVMAdapter      - EVM chain       │
└─────────────────────────────────────────┘
```

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## API Endpoints

### Health Check
```
GET /health
→ { status: "ok", timestamp: "..." }
```

### Agents
```
GET    /api/agents          - List all agents
POST   /api/agents          - Create agent
GET    /api/agents/:id      - Get agent
PUT    /api/agents/:id      - Update agent
DELETE /api/agents/:id      - Delete agent
```

### Payments
```
POST /api/payments          - Execute payment
GET  /api/payments          - List transactions
GET  /api/payments/:id      - Get transaction
```

### Audit
```
GET /api/audit              - All audit events
GET /api/audit/agent/:id    - Events for agent
```

## Authentication

All `/api/*` endpoints require authentication:

```bash
# API Key
curl -H "Authorization: Bearer dev-key-123" http://localhost:3001/api/agents

# JWT
curl -H "Authorization: Token <jwt-token>" http://localhost:3001/api/agents
```

## Transaction Lifecycle

1. **PENDING** - Request received
2. **POLICY_CHECK** - Policy engine evaluates
3. **REJECTED** (if policy fails) or **SIMULATING**
4. **SIMULATING** - Transaction simulation
5. **SIGNING** - Transaction signing
6. **SUBMITTING** - Chain submission
7. **CONFIRMED** / **FAILED**

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Server port |
| JWT_SECRET | dev-secret | JWT signing secret |
| API_KEYS | dev-key-123 | Comma-separated API keys |
| RATE_LIMIT_MAX | 100 | Max requests per minute |
