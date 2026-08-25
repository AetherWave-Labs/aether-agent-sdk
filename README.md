# aether-agent-sdk

Modular SDK for building autonomous agents that interact with blockchain infrastructure, execute on-chain token payments, query decentralized RPCs, and interact with smart contracts across Stellar Soroban and EVM-compatible networks.

The SDK provides a developer-focused abstraction layer for autonomous agents that need to make verifiable, programmable on-chain decisions without tightly coupling application logic to a specific blockchain provider.

## Overview

`aether-agent-sdk` is designed to provide reusable building blocks for autonomous blockchain agents.

The SDK focuses on four core capabilities:

1. **On-Chain Payments** — Execute token payments such as USDC transfers through supported blockchain networks.
2. **Blockchain Queries** — Query decentralized RPC endpoints for balances, transactions, contract state, and network information.
3. **Smart Contract Interaction** — Provide structured interfaces for interacting with Soroban and EVM smart contracts.
4. **Agent Execution** — Give autonomous agents a consistent interface for deciding, preparing, submitting, and monitoring blockchain operations.

The architecture is intentionally modular so that additional chains, tokens, RPC providers, and contract integrations can be introduced without changing the core agent interfaces.

## Goals

* Provide a simple SDK for autonomous blockchain agents.
* Support Stellar Soroban and EVM-compatible networks.
* Provide safe token payment primitives.
* Abstract blockchain provider-specific implementations.
* Support decentralized RPC infrastructure.
* Provide consistent transaction and error handling.
* Make blockchain operations testable.
* Keep network-specific functionality isolated behind adapters.
* Provide clear documentation and examples for contributors.

## Architecture

The SDK separates agent logic from blockchain execution:

```text
                    ┌──────────────────────┐
                    │   Autonomous Agent   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     Agent SDK        │
                    │                      │
                    │ Payment              │
                    │ Query                │
                    │ Contract Interaction │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
       ┌──────────────────┐        ┌──────────────────┐
       │ Stellar Adapter  │        │ EVM Adapter      │
       │                  │        │                  │
       │ Soroban          │        │ RPC              │
       │ Token Operations │        │ Contracts        │
       └────────┬─────────┘        └────────┬─────────┘
                │                           │
                ▼                           ▼
       ┌──────────────────┐        ┌──────────────────┐
       │ Stellar Network  │        │ EVM Network      │
       └──────────────────┘        └──────────────────┘
```

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

This separation allows agent decision-making to remain independent from transaction execution.

## Token Payments

The SDK provides primitives for token payments across supported networks.

A payment request should contain enough information to identify:

* Network.
* Token/asset.
* Sender.
* Recipient.
* Amount.
* Optional transaction configuration.

Example:

```typescript
const payment = await agent.pay({
  network: "stellar-testnet",
  asset: "USDC",
  recipient: "RECIPIENT_ADDRESS",
  amount: "10.50",
});
```

The exact API is subject to implementation and may evolve as supported networks are expanded.

### Payment Safety

Payment operations should:

* Validate recipient addresses.
* Validate token identifiers.
* Reject zero or negative amounts.
* Avoid floating-point arithmetic for token amounts.
* Simulate or estimate transactions where supported.
* Provide deterministic errors.
* Never expose private keys or signing secrets.

## Stellar Soroban

The Stellar integration provides access to:

* Soroban smart contracts.
* Stellar token operations.
* Transaction preparation.
* Transaction simulation.
* Transaction submission.
* Transaction status.

Network configuration should support at least:

```text
Stellar Testnet
Stellar Mainnet
Custom RPC Endpoint
```

Network-specific functionality should remain isolated inside the Stellar adapter.

## EVM Networks

The EVM integration is designed to support EVM-compatible networks through configurable RPC providers.

The adapter should provide abstractions for:

* Native asset transfers.
* ERC-20 token transfers.
* Contract calls.
* Transaction submission.
* Transaction receipt retrieval.
* Gas estimation.

The initial implementation should avoid coupling the core SDK to a single EVM network.

## RPC Layer

The RPC layer provides a common interface for communicating with decentralized blockchain infrastructure.

Responsibilities include:

* Endpoint configuration.
* Request execution.
* Response normalization.
* Timeout handling.
* Retry handling.
* Provider failure reporting.

Transient RPC failures may be retried using a configurable backoff policy.

Transaction rejection or deterministic contract failures should not be blindly retried.

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
PREPARED → FAILED
SIMULATED → FAILED
SUBMITTED → FAILED
```

The SDK should preserve enough context to allow developers to diagnose failures without exposing sensitive information.

## Error Handling

The SDK should provide normalized errors across supported blockchain networks.

Common error categories include:

* `VALIDATION_ERROR`
* `NETWORK_ERROR`
* `RPC_ERROR`
* `INSUFFICIENT_BALANCE`
* `TRANSACTION_REJECTED`
* `CONTRACT_ERROR`
* `SIMULATION_ERROR`
* `TRANSACTION_TIMEOUT`

Provider-specific errors should be mapped to these common categories where possible while preserving useful underlying context.

## API Design Principles

The SDK follows several design principles:

### Network Agnostic Core

Core agent and payment interfaces should not depend directly on Stellar or EVM implementation details.

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

## Development

### Prerequisites

Install:

* Node.js 20+
* npm
* Git

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

* Payment validation.
* Address validation.
* Token amount handling.
* Network configuration.
* RPC failures.
* Transaction lifecycle.
* Transaction simulation.
* Contract interactions.
* Stellar operations.
* EVM operations.
* Error normalization.

Blockchain integration tests should use dedicated test networks or controlled mocks where appropriate.

## Examples

Examples will demonstrate common SDK workflows:

```text
examples/
├── stellar-payment/
├── evm-payment/
├── contract-call/
├── rpc-query/
└── autonomous-agent/
```

Example use cases include:

* Sending USDC.
* Querying token balances.
* Calling a Soroban contract.
* Calling an EVM smart contract.
* Handling transaction confirmation.
* Handling failed transactions.

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
feat/rpc-retry-policy
fix/payment-validation
test/address-validation
docs/sdk-quickstart
```

### Commit Convention

Use Conventional Commits:

```text
feat: add stellar payment helper
fix: validate payment amount
test: add rpc retry tests
docs: improve sdk setup
refactor: isolate evm transaction adapter
```

Commit subjects should be lowercase.

## Good First Issues

The SDK is designed to support small, independently deliverable contributor tasks.

Examples include:

* Add payment request validation.
* Add Stellar network configuration helper.
* Add USDC amount conversion utility.
* Add transaction simulation.
* Standardize transaction errors.
* Add RPC retry policy.
* Add payment transaction receipt helper.
* Add SDK payment examples.
* Add address validation tests.
* Add structured transaction lifecycle logging.

Each issue should define a focused scope, technical context, acceptance criteria, and expected tests.

## Roadmap

### Phase 1 — SDK Foundation

* [ ] Initialize TypeScript SDK.
* [ ] Establish package structure.
* [ ] Add configuration management.
* [ ] Add common types.
* [ ] Add error model.
* [ ] Add testing infrastructure.
* [ ] Add CI checks.

### Phase 2 — Blockchain Connectivity

* [ ] Implement common RPC interface.
* [ ] Implement Stellar adapter.
* [ ] Implement EVM adapter.
* [ ] Add network configuration.
* [ ] Add RPC retry handling.

### Phase 3 — Payments

* [ ] Implement payment interface.
* [ ] Add USDC support.
* [ ] Add Stellar token payments.
* [ ] Add EVM ERC-20 payments.
* [ ] Add transaction simulation.
* [ ] Add transaction receipt handling.

### Phase 4 — Smart Contracts

* [ ] Add common contract interface.
* [ ] Add Soroban contract adapter.
* [ ] Add EVM contract adapter.
* [ ] Add contract error normalization.
* [ ] Add contract interaction examples.

### Phase 5 — Autonomous Agent Workflows

* [ ] Add agent execution abstraction.
* [ ] Support programmable payment policies.
* [ ] Support transaction decision workflows.
* [ ] Add execution monitoring.
* [ ] Add safeguards for autonomous transactions.

## Security

Security is critical because the SDK may be used to execute financial transactions.

Contributors must:

* Never commit private keys.
* Never commit seed phrases.
* Never expose signing credentials.
* Never log private transaction secrets.
* Validate all externally supplied transaction parameters.
* Avoid unsafe floating-point calculations for token amounts.
* Clearly distinguish simulation from actual transaction submission.
* Avoid automatically retrying transactions when doing so could cause duplicate execution.
* Treat smart-contract interactions as untrusted external operations.

Report security vulnerabilities through the repository's designated security reporting process rather than publicly disclosing exploit details.

## Project Status

**Early development**

`aether-agent-sdk` is currently being established as a modular SDK for autonomous blockchain agents.

The architecture and public APIs may evolve during initial development. Contributors should therefore prefer small, isolated changes that follow the existing interfaces and project conventions.

The long-term objective is to provide a reliable abstraction layer through which autonomous agents can safely query blockchain networks, execute token payments, and interact with smart contracts across Stellar Soroban and EVM-compatible ecosystems.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
