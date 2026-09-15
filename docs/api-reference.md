# API Reference

Complete reference for classes, interfaces, and methods in `@aetherwave/aether-agent-sdk`.

---

## Agent

Core coordinator for agent state, policy enforcement, and blockchain transaction pipelines.

### `constructor(config: AgentConfig)`

- `config.id`: Unique agent identifier.
- `config.name`: Human-readable label.
- `config.adapter`: Instance of `ChainAdapter` (e.g. `StellarAdapter`, `EVMAdapter`).
- `config.policy`: Optional `AgentPolicy` object containing spending limits and allowlists.

### Methods

- `executePayment(request: PaymentRequest): Promise<TransactionResult>`
- `queryState(query: StateQuery): Promise<QueryResult>`
- `getPolicy(): AgentPolicy`
- `updatePolicy(policy: Partial<AgentPolicy>): void`

---

## Chain Adapters

Abstract interface and implementations for blockchain interactions.

### `ChainAdapter` Interface

- `getNetwork(): NetworkConfig`
- `getBalance(address: string, asset?: string): Promise<string>`
- `submitTransaction(tx: PreparedTransaction): Promise<TransactionResult>`
- `simulateTransaction(tx: PreparedTransaction): Promise<SimulationResult>`

### Concrete Adapters

- `StellarAdapter`: Stellar Classic & Soroban smart contracts.
- `EVMAdapter`: EVM-compatible chains (Ethereum, Sepolia, Arbitrum, Base, Optimism, Polygon).

---

## PaymentManager

- `validateRequest(request: PaymentRequest): ValidationResult`
- `preparePayment(request: PaymentRequest): Promise<PreparedTransaction>`
- `execute(request: PaymentRequest): Promise<TransactionResult>`

---

## RPCClient

Resilient JSON-RPC client with configurable retries, jitter, and fallback providers.

### `constructor(config: RPCClientConfig)`

- `config.primaryUrl`: Main RPC endpoint.
- `config.fallbackUrls`: Array of fallback RPC endpoints.
- `config.retryConfig`: Maximum attempts, delay in ms, backoff factor.

### Methods

- `call<T>(method: string, params: unknown[]): Promise<T>`
- `healthCheck(): Promise<boolean>`

---

## Errors

- `AetherError`: Base error class.
- `ValidationError`: Invalid input parameters, malformed addresses, or amounts.
- `PolicyError`: Spending limit or recipient policy violations.
- `TransactionError`: On-chain transaction simulation or execution failures.
- `NetworkError`: RPC timeout, connection error, or unreachable host.
