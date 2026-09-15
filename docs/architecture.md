# Aether Agent SDK Architecture

The Aether Agent SDK decouples **agent decision-making** from **blockchain transaction execution and state observation**.

## High-Level Diagram

```text
                        ┌────────────────────────┐
                        │   Autonomous Agent     │
                        │ (LLM / Rule Engine)    │
                        └───────────┬────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Aether Agent SDK Core                           │
│                                                                        │
│   ┌───────────────────┐ ┌───────────────────┐ ┌────────────────────┐   │
│   │   Agent Engine    │ │ Payment Manager   │ │  RPC & Query Hub   │   │
│   │  (Policy & Flow)  │ │ (Validation/USDC) │ │ (Resilient Client) │   │
│   └─────────┬─────────┘ └─────────┬─────────┘ └─────────┬──────────┘   │
│             │                     │                     │              │
│             └─────────────────────┼─────────────────────┘              │
│                                   │                                    │
│                                   ▼                                    │
│                 ┌───────────────────────────────────┐                  │
│                 │      Chain Adapter Interface      │                  │
│                 └─────────┬───────────────┬─────────┘                  │
└───────────────────────────┼───────────────┼────────────────────────────┘
                            │               │
                            ▼               ▼
                 ┌────────────────────┐   ┌────────────────────┐
                 │  Stellar / Soroban │   │   EVM-Compatible   │
                 │      Adapter       │   │      Adapter       │
                 └──────────┬─────────┘   └─────────┬──────────┘
                            │                       │
                            ▼                       ▼
                   Stellar Horizon / RPC      EVM JSON-RPC
```

## Lifecycle of an Agent Operation

1. **Decision**: The agent determines an intent (e.g., "Send 10 USDC to recipient `G...`").
2. **Validation**: The SDK inspects parameters, formats, and checksums.
3. **Policy Checking**: Spending limits, daily caps, and allowlists are evaluated.
4. **Transaction Preparation**: The appropriate chain adapter builds the raw payload.
5. **Simulation / Estimation**: Resource limits, gas/fees, and simulation responses are validated.
6. **Signing**: Transaction is signed by the local signer or MPC adapter.
7. **Submission & Retry**: Resilient RPC submission with exponential backoff.
8. **Confirmation & Result**: The SDK waits for ledger/block confirmation and returns a typed execution receipt.

## Key Modules

- `src/agents`: Coordinates decision pipelines and policy enforcement.
- `src/payments`: Handles token transfers, USDC assets, and parameter validation.
- `src/chains`: Abstract chain interface with concrete adapters for Stellar/Soroban and EVM.
- `src/rpc`: Fault-tolerant RPC client with multi-provider failover and backoff retries.
- `src/contracts`: Standardized smart contract invocation interfaces.
- `src/errors`: Standardized, actionable error definitions.
- `src/config`: Network configurations and environment loading.
