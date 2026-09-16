# aether-agent-sdk

**Modular SDK for autonomous on-chain payments, decentralized RPC queries, and smart-contract interactions across Stellar/Soroban and EVM-compatible networks.**

`aether-agent-sdk` is a developer-focused SDK for building autonomous blockchain agents that can make programmable decisions, query decentralized infrastructure, prepare and execute token payments, and interact with smart contracts without tightly coupling application logic to a specific blockchain provider.

The project is designed with **Stellar/Soroban as a primary ecosystem target**, with EVM-compatible networks supported through the same adapter-oriented architecture.

## Why This SDK

Autonomous applications need more than wallet connectivity. An agent may need to:

1. Observe blockchain state.
2. Evaluate a condition or policy.
3. Determine whether an on-chain action is appropriate.
4. Validate the requested operation.
5. Prepare and simulate a transaction.
6. Submit the transaction through appropriate infrastructure.
7. Monitor confirmation.
8. Return a structured result to the application or agent.

`aether-agent-sdk` provides the reusable execution layer for this workflow.

The SDK is intentionally designed to separate **agent decision-making** from **blockchain execution**, allowing applications to build autonomous workflows without embedding Stellar, Soroban, EVM, RPC-provider, or transaction-specific logic directly into their business code.

## Core Capabilities

The SDK focuses on four core capabilities:

1. **On-Chain Payments** — Execute token payments such as USDC transfers through supported blockchain networks.
2. **Blockchain Queries** — Query decentralized RPC endpoints for balances, transactions, contract state, and network information.
3. **Smart Contract Interaction** — Provide structured interfaces for interacting with Soroban and EVM smart contracts.
4. **Agent Execution** — Give autonomous agents a consistent interface for deciding, preparing, submitting, and monitoring blockchain operations.

The architecture is intentionally modular so that additional chains, tokens, RPC providers, and contract integrations can be introduced without changing the core agent interfaces.

## Stellar-First Ecosystem Positioning

Stellar/Soroban is a primary integration target for `aether-agent-sdk`.

The SDK is intended to provide a practical execution layer for applications that need to build programmable financial and autonomous workflows on Stellar, including:

- USDC payment automation.
- Agent-controlled transfers.
- Soroban smart-contract calls.
- Blockchain state queries.
- Transaction preparation and simulation.
- Transaction submission and confirmation.
- Decentralized RPC access.
- Policy-controlled autonomous execution.

The goal is not to replace Stellar's native tooling. Instead, the SDK provides a higher-level abstraction for applications and autonomous agents that need to combine **decision logic + blockchain queries + transaction execution**.

EVM-compatible networks remain supported through isolated adapters so that the core SDK does not become dependent on a single blockchain ecosystem.

## Goals

- Provide a simple SDK for autonomous blockchain agents.
- Make Stellar/Soroban a first-class integration target.
- Support EVM-compatible networks through adapters.
- Provide safe token payment primitives.
- Support USDC payment workflows.
- Abstract blockchain provider-specific implementations.
- Support decentralized RPC infrastructure.
- Provide consistent transaction and error handling.
- Make blockchain operations testable.
- Keep network-specific functionality isolated behind adapters.
- Provide clear documentation and examples for contributors.
- Establish safeguards suitable for programmable and autonomous transaction workflows.

## Architecture

The SDK separates agent logic from blockchain execution:

```text
                         Autonomous Agent
                                │
                                ▼
                    ┌────────────────────────┐
                    │       Agent SDK        │
                    │                        │
                    │ Decision / Policy      │
                    │ Payment                │
                    │ Query                  │
                    │ Contract Interaction   │
                    └────────────┬───────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
             ┌───────────────┐        ┌───────────────┐
             │ Stellar       │        │ EVM           │
             │ Adapter       │        │ Adapter       │
             │               │        │               │
             │ Soroban       │        │ RPC           │
             │ Payments      │        │ ERC-20        │
             │ Contracts     │        │ Contracts     │
             └───────┬───────┘        └───────┬───────┘
                     │                          │
                     ▼                          ▼
             Stellar / Soroban          EVM-compatible
                  Network                   Network
```

### Execution Model

A typical autonomous transaction workflow is:

```text
Agent Decision
      │
      ▼
SDK Operation
      │
      ▼
Validate Request
      │
      ▼
Check Policy / Limits
      │
      ▼
Prepare Transaction
      │
      ▼
Simulate / Estimate
      │
      ▼
Sign
      │
      ▼
Submit
      │
      ▼
Confirm
      │
      ▼
Return Structured Result
```

This separation allows agent decision-making to remain independent from transaction execution.

## Planned Project Structure

```text
aether-agent-sdk/
├── src/
│   ├── agents/
│   │   ├── agent.ts
│   │   └── types.ts
│   │
│   ├── payments/
│   │   ├── payment.ts
│   │   ├── types.ts
│   │   └── validators.ts
│   │
│   ├── chains/
│   │   ├── stellar/
│   │   │   ├── client.ts
│   │   │   ├── payments.ts
│   │   │   └── contracts.ts
│   │   │
│   │   └── evm/
│   │       ├── client.ts
│   │       ├── payments.ts
│   │       └── contracts.ts
│   │
│   ├── rpc/
│   │   ├── client.ts
│   │   ├── providers.ts
│   │   └── retry.ts
│   │
│   ├── contracts/
│   │   ├── interface.ts
│   │   └── adapters/
│   │
│   ├── errors/
│   │   └── transaction.ts
│   │
│   ├── config/
│   │   └── networks.ts
│   │
│   └── index.ts
│
├── tests/
├── examples/
├── docs/
├── .env.example
├── .gitignore
├── LICENSE
├── README.md
├── package.json
└── tsconfig.json
```

## Core Concepts

### Agent Execution

Agents should be able to perform blockchain operations through a consistent SDK interface rather than directly depending on network-specific implementations.

Conceptually:

```text
Agent Decision
      │
      ▼
SDK Operation
      │
      ▼
Validate Request
      │
      ▼
Policy / Limits
      │
      ▼
Prepare Transaction
      │
      ▼
Simulate / Estimate
      │
      ▼
Sign
      │
      ▼
Submit
      │
      ▼
Confirm
      │
      ▼
Return Result
```

The SDK should keep the distinction between:

- **Decision** — What the agent wants to do.
- **Policy** — What the application allows the agent to do.
- **Execution** — How the blockchain transaction is prepared and submitted.
- **Observation** — What the blockchain reports after submission.

This separation is important for auditable autonomous workflows.

## Token Payments

The SDK provides primitives for token payments across supported networks.

A payment request should contain enough information to identify:

- Network.
- Token/asset.
- Sender.
- Recipient.
- Amount.
- Optional transaction configuration.
- Optional execution policy or limits.

Example:

```typescript
const payment = await agent.pay({
  network: 'stellar-testnet',
  asset: 'USDC',
  recipient: 'RECIPIENT_ADDRESS',
  amount: '10.50',
});
```

The exact API is subject to implementation and may evolve as supported networks are expanded.

### USDC

USDC is a key payment use case for the SDK.

The payment layer should keep token-specific handling separate from the core agent interface so that USDC can be supported across compatible networks without creating network-specific application logic.

A production implementation should explicitly configure:

- Network.
- Token/asset identifier.
- Token decimals.
- Sender account.
- Recipient account.
- Amount representation.
- Transaction fee configuration.
- Confirmation requirements.

### Payment Safety

Payment operations should:

- Validate recipient addresses.
- Validate token identifiers.
- Reject zero or negative amounts.
- Avoid floating-point arithmetic for token amounts.
- Use exact decimal or integer representations.
- Simulate or estimate transactions where supported.
- Apply configured payment limits.
- Provide deterministic errors.
- Prevent accidental duplicate execution where possible.
- Never expose private keys or signing secrets.

## Autonomous Payment Policies

Autonomous payments should not rely solely on an agent's generated decision.

The SDK should provide a policy layer that can constrain execution.

Potential controls include:

- Maximum payment amount.
- Allowed networks.
- Allowed tokens.
- Allowed recipients.
- Per-transaction limits.
- Daily or session spending limits.
- Required simulation.
- Required confirmation.
- Contract allowlists.
- Explicit dry-run mode.

Conceptually:

```text
Agent wants to pay
        │
        ▼
Payment Request
        │
        ▼
Policy Validation
        │
   ┌────┴────┐
   │         │
 Reject     Allow
   │         │
   ▼         ▼
 Error    Prepare
              │
              ▼
          Simulate
              │
              ▼
            Sign
              │
              ▼
           Submit
```

Policy enforcement belongs between agent intent and transaction execution.

## Stellar / Soroban

The Stellar integration provides access to:

- Soroban smart contracts.
- Stellar token operations.
- USDC payment workflows.
- Transaction preparation.
- Transaction simulation.
- Transaction submission.
- Transaction status.
- Network configuration.

Network configuration should support at least:

```text
Stellar Testnet
Stellar Mainnet
Custom RPC Endpoint
```

Network-specific functionality should remain isolated inside the Stellar adapter.

### Soroban Contract Interaction

Soroban contract calls should expose a structured interface for:

- Contract identification.
- Method/function invocation.
- Arguments.
- Simulation.
- Transaction preparation.
- Submission.
- Confirmation.
- Contract error handling.

The core SDK should not require agent code to understand provider-specific transport details.

## EVM Networks

The EVM integration is designed to support EVM-compatible networks through configurable RPC providers.

The adapter should provide abstractions for:

- Native asset transfers.
- ERC-20 token transfers.
- USDC-compatible ERC-20 payments.
- Contract calls.
- Transaction submission.
- Transaction receipt retrieval.
- Gas estimation.

The initial implementation should avoid coupling the core SDK to a single EVM network.

## RPC Layer

The RPC layer provides a common interface for communicating with decentralized blockchain infrastructure.

Responsibilities include:

- Endpoint configuration.
- Request execution.
- Response normalization.
- Timeout handling.
- Retry handling.
- Provider failure reporting.
- Provider selection.
- Health awareness where supported.

Transient RPC failures may be retried using a configurable backoff policy.

Transaction rejection or deterministic contract failures should not be blindly retried.

### Decentralized RPC Strategy

The SDK should avoid assuming that one RPC provider is permanently available.

Where multiple endpoints are configured, the RPC layer may support:

```text
                 SDK RPC Client
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      Provider A   Provider B   Provider C
          │            │            │
          └────────────┴────────────┘
                       │
                       ▼
                Blockchain Network
```

Provider selection, retry, timeout, and failover behavior should remain configurable.

## Blockchain Queries

The query layer provides read-oriented access to blockchain state.

Potential operations include:

- Account balances.
- Token balances.
- Transaction lookup.
- Transaction status.
- Network information.
- Contract state.
- Contract metadata where available.
- Recent blockchain activity.

Read operations should remain independent from transaction signing and submission.

Example conceptual interface:

```typescript
const balance = await agent.query.balance({
  network: 'stellar-testnet',
  asset: 'USDC',
  account: 'ACCOUNT_ADDRESS',
});
```

The exact API is subject to implementation.

## Transaction Lifecycle

Transactions should follow a predictable lifecycle:

```text
CREATED
   │
   ▼
VALIDATED
   │
   ▼
PREPARED
   │
   ▼
SIMULATED
   │
   ▼
SUBMITTED
   │
   ▼
CONFIRMED
```

Failures should be represented explicitly:

```text
PREPARED  → FAILED
SIMULATED → FAILED
SUBMITTED → FAILED
```

The SDK should preserve enough context to allow developers to diagnose failures without exposing sensitive information.

## Error Handling

The SDK should provide normalized errors across supported blockchain networks.

Common error categories include:

- `VALIDATION_ERROR`
- `NETWORK_ERROR`
- `RPC_ERROR`
- `INSUFFICIENT_BALANCE`
- `TRANSACTION_REJECTED`
- `CONTRACT_ERROR`
- `SIMULATION_ERROR`
- `TRANSACTION_TIMEOUT`
- `POLICY_VIOLATION`
- `UNSUPPORTED_NETWORK`
- `UNSUPPORTED_ASSET`

Provider-specific errors should be mapped to these common categories where possible while preserving useful underlying context.

## API Design Principles

The SDK follows several design principles.

### Network-Agnostic Core

Core agent, payment, query, and policy interfaces should not depend directly on Stellar or EVM implementation details.

### Adapter-Based Integrations

Network-specific behavior should be implemented through adapters.

```text
Core Interface
      │
 ┌────┴────┐
 ▼         ▼
Stellar    EVM
Adapter    Adapter
```

### Explicit Configuration

Network and RPC configuration should be explicit rather than hidden in global state.

### Deterministic Operations

Operations should produce predictable results and errors for the same inputs and network state.

### Testability

Blockchain-dependent functionality should be abstracted sufficiently to allow unit and integration testing without requiring every test to submit a live transaction.

### Safety by Default

Financial operations should favor explicit validation, bounded execution, simulation where supported, and clear transaction state over implicit or opaque behavior.

## Development

### Prerequisites

Install:

- Node.js 20+
- npm
- Git

Additional dependencies will be documented as the corresponding modules are implemented.

### Setup

Clone the repository:

```bash
git clone https://github.com/rabsqueen/aether-agent-sdk.git
cd aether-agent-sdk
```

Install dependencies:

```bash
npm install
```

Create the local environment file:

```bash
cp .env.example .env
```

Configure the required network and RPC settings before running blockchain-dependent functionality.

> **Note:** The repository is currently being established. Exact development commands and environment variables will be finalized alongside the initial implementation.

## Testing

Tests should be separated according to their responsibility:

```text
tests/
├── unit/
├── integration/
└── e2e/
```

The test suite will cover:

- Payment validation.
- Address validation.
- Token amount handling.
- USDC payment configuration.
- Network configuration.
- RPC failures.
- RPC retry behavior.
- Transaction lifecycle.
- Transaction simulation.
- Contract interactions.
- Stellar operations.
- Soroban operations.
- EVM operations.
- Error normalization.
- Autonomous payment policies.
- Duplicate-submission safeguards.

Blockchain integration tests should use dedicated test networks or controlled mocks where appropriate.

## Examples

Examples will demonstrate common SDK workflows:

```text
examples/
├── stellar-payment/
├── usdc-payment/
├── evm-payment/
├── contract-call/
├── rpc-query/
└── autonomous-agent/
```

Example use cases include:

- Sending USDC.
- Querying token balances.
- Calling a Soroban contract.
- Calling an EVM smart contract.
- Querying decentralized RPC infrastructure.
- Applying a payment policy.
- Simulating a transaction.
- Handling transaction confirmation.
- Handling failed transactions.

## Contributing

Contributions are welcome.

Before starting work:

1. Check the existing issues.
2. Select an unassigned issue.
3. Read the complete issue description and acceptance criteria.
4. Create a focused branch.
5. Keep the implementation within the issue scope.
6. Add or update tests.
7. Run the project's quality checks.
8. Open a pull request describing the changes.

### Branch Naming

Use descriptive branch names:

```text
feat/stellar-payment
feat/usdc-payment
feat/soroban-contracts
feat/rpc-retry-policy
fix/payment-validation
test/address-validation
docs/sdk-quickstart
```

### Commit Convention

Use Conventional Commits:

```text
feat: add stellar payment helper
feat: add usdc payment support
feat: add soroban contract adapter
fix: validate payment amount
test: add rpc retry tests
docs: improve sdk setup
refactor: isolate evm transaction adapter
```

Commit subjects should be lowercase.

## Good First Issues

The SDK is designed to support small, independently deliverable contributor tasks.

Examples include:

- Add payment request validation.
- Add Stellar network configuration helper.
- Add USDC amount conversion utility.
- Add transaction simulation.
- Standardize transaction errors.
- Add RPC retry policy.
- Add payment transaction receipt helper.
- Add SDK payment examples.
- Add address validation tests.
- Add structured transaction lifecycle logging.
- Add Soroban contract call helper.
- Add autonomous payment policy validation.
- Add transaction duplicate-submission safeguards.

Each issue should define a focused scope, technical context, acceptance criteria, and expected tests.

## Roadmap

### Phase 1 — SDK Foundation

- [ ] Initialize TypeScript SDK.
- [ ] Establish package structure.
- [ ] Add configuration management.
- [ ] Add common types.
- [ ] Add error model.
- [ ] Add testing infrastructure.
- [ ] Add CI checks.

### Phase 2 — Stellar / Soroban Connectivity

- [ ] Implement common RPC interface.
- [ ] Implement Stellar adapter.
- [ ] Implement Soroban connectivity.
- [ ] Add Stellar network configuration.
- [ ] Add decentralized RPC support.
- [ ] Add RPC retry handling.
- [ ] Add transaction simulation.

### Phase 3 — Payments

- [ ] Implement payment interface.
- [ ] Add USDC support.
- [ ] Add Stellar token payments.
- [ ] Add EVM ERC-20 payments.
- [ ] Add transaction simulation.
- [ ] Add transaction receipt handling.
- [ ] Add payment policy controls.
- [ ] Add execution safeguards.

### Phase 4 — Smart Contracts

- [ ] Add common contract interface.
- [ ] Add Soroban contract adapter.
- [ ] Add EVM contract adapter.
- [ ] Add contract error normalization.
- [ ] Add contract interaction examples.
- [ ] Add simulation-first workflows where supported.

### Phase 5 — Autonomous Agent Workflows

- [ ] Add agent execution abstraction.
- [ ] Support programmable payment policies.
- [ ] Support transaction decision workflows.
- [ ] Add execution monitoring.
- [ ] Add safeguards for autonomous transactions.
- [ ] Add structured execution results.
- [ ] Add configurable spending and recipient controls.

### Phase 6 — Developer and Ecosystem Tooling

- [ ] Publish stable SDK interfaces.
- [ ] Expand examples and documentation.
- [ ] Add integration test fixtures.
- [ ] Improve provider failover.
- [ ] Add observability hooks.
- [ ] Provide reusable agent workflow primitives.

## Security

Security is critical because the SDK may be used to execute financial transactions.

Contributors must:

- Never commit private keys.
- Never commit seed phrases.
- Never expose signing credentials.
- Never log private transaction secrets.
- Validate all externally supplied transaction parameters.
- Avoid unsafe floating-point calculations for token amounts.
- Clearly distinguish simulation from actual transaction submission.
- Avoid automatically retrying transactions when doing so could cause duplicate execution.
- Treat smart-contract interactions as untrusted external operations.
- Apply explicit limits to autonomous payment workflows.
- Keep signing and execution credentials outside source control.
- Prefer least-privilege configuration for agent execution environments.

Autonomous execution should always remain bounded by application-defined policy. An agent's decision to execute a transaction must not, by itself, bypass configured safety constraints.

Report security vulnerabilities through the repository's designated security reporting process rather than publicly disclosing exploit details.

## Ecosystem Positioning

`aether-agent-sdk` is intended to serve as an open-source execution primitive for applications that connect autonomous software agents with blockchain infrastructure.

Its architecture is particularly suited to workflows where an agent needs to:

```text
Observe
   │
   ▼
Reason
   │
   ▼
Apply Policy
   │
   ▼
Prepare
   │
   ▼
Simulate
   │
   ▼
Execute
   │
   ▼
Verify
```

The project focuses on the infrastructure between **agent intent and verifiable on-chain execution**.

Stellar/Soroban provides a primary ecosystem target, while the adapter model allows the same agent-level abstractions to operate across EVM-compatible networks.

Potential application areas include:

- Autonomous payment agents.
- AI-powered financial applications.
- Treasury automation.
- Programmable USDC payments.
- Agent-to-agent payments.
- Smart-contract automation.
- Blockchain monitoring agents.
- DeFi automation.
- On-chain data and decision systems.
- Autonomous service marketplaces.

## Complete System Architecture

The SDK is part of a complete autonomous blockchain execution workflow:

```text
                    ┌──────────────────┐
                    │ Agent / User     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    Frontend      │
                    │ Operations UI    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │     Backend      │
                    │ API + Services   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Policy Engine   │
                    └────────┬─────────┘
                             │
                     Policy Approved
                             │
                             ▼
                    ┌──────────────────┐
                    │ Transaction      │
                    │ Execution        │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Stellar Adapter  │
                    └────────┬─────────┘
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
       ┌────────────────┐       ┌─────────────────┐
       │ Stellar Network│       │ Soroban Contract│
       └────────────────┘       └─────────────────┘
```

### End-to-End Flow

```text
Agent creates payment request
↓
Frontend submits request
↓
Backend receives request
↓
Authentication/authorization
↓
Policy engine evaluates request
↓
Invalid request → Reject
↓
Valid request
↓
Transaction preparation
↓
Simulation
↓
Signing
↓
Submission
↓
Stellar/Soroban execution
↓
Confirmation monitoring
↓
Transaction lifecycle update
↓
Audit event
↓
Backend returns status
↓
Frontend displays result
```

### Project Structure

```text
aether-agent-sdk/
├── src/                    # Core SDK (TypeScript)
│   ├── agents/             # Agent + policy enforcement
│   ├── chains/             # Chain adapters (Stellar, EVM)
│   ├── config/             # Network configurations
│   ├── contracts/          # Smart contract interfaces
│   ├── errors/             # Error hierarchy
│   ├── payments/           # Payment validation & execution
│   └── rpc/                # RPC client with retry/failover
├── backend/                # Express API server
│   └── src/
│       ├── middleware/      # Auth, rate-limit, error handling
│       ├── routes/         # API endpoints
│       ├── services/       # Policy engine, transaction executor
│       └── types/          # Shared types
├── frontend/               # Next.js operations UI
│   └── src/
│       ├── app/            # Pages (dashboard, transactions, policies, audit)
│       ├── components/     # UI components
│       └── lib/            # API client
├── contract/
│   ├── soroban/            # Rust/Soroban policy contract
│   └── evm/                # Solidity policy contract
├── tests/                  # Test suite
│   ├── e2e/                # End-to-end integration tests
│   └── unit/               # Unit tests
└── docs/                   # Documentation
```

### Running the System

```bash
# Install SDK dependencies
npm install

# Run SDK tests
npm test

# Build SDK
npm run build

# Start backend
cd backend && npm install && npm run dev

# Start frontend
cd frontend && npm install && npm run dev
```

### E2E Test Coverage

The test suite covers all required scenarios:

1. Successful payment
2. Policy rejection (amount exceeded)
3. Invalid recipient
4. Invalid amount
5. Insufficient balance (daily limit)
6. Simulation failure handling
7. Signing phase
8. Transaction failure handling
9. Policy rejection (disallowed recipient)
10. Confirmation tracking via audit trail
11. Duplicate submission prevention
12. Memo requirement enforcement
13. Rate-limit rejection (audit logging)

## Project Status

**Integrated**

The SDK now includes a complete autonomous blockchain execution workflow with:

- Core SDK with agent, payment, chain adapter, and RPC modules
- Backend API with authentication, policy engine, and transaction execution
- Frontend operations UI with dashboard, transaction explorer, and policy configuration
- Soroban smart contract for on-chain policy enforcement
- EVM smart contract for cross-chain policy enforcement
- End-to-end test coverage for all 13 required scenarios
- Complete documentation

The architecture and public APIs may evolve during initial development. Contributors should therefore prefer small, isolated changes that follow the existing interfaces and project conventions.

## License

This project is licensed under the Apache 2.0 License. See [LICENSE](LICENSE) for details.
