# Soroban Contract Workspace

This directory contains the Soroban smart-contract workspace for the
AetherWave Agent SDK.

The workspace is responsible for contract development, local testing,
WASM compilation, and environment-aware Stellar testnet deployment.

## Workspace Structure

```text
soroban/
├── src/
│   └── lib.rs
├── interfaces/
├── types/
├── test/
├── scripts/
│   ├── test.sh
│   └── deploy-testnet.sh
├── deployments/
├── .env.example
├── .gitignore
├── Cargo.toml
├── Cargo.lock
└── README.md