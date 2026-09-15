# Soroban Smart Contracts

This folder contains Stellar Soroban smart contracts written in Rust.

## Prerequisites

- [Rust & Cargo](https://rustup.rs/) (edition 2021)
- `wasm32-unknown-unknown` target: `rustup target add wasm32-unknown-unknown`
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/stellar-cli): `cargo install --locked stellar-cli`

## Typical Workflow

```bash
# Build contracts to WASM
cargo build --target wasm32-unknown-unknown --release

# Run Rust unit tests
cargo test

# Deploy to Stellar Testnet
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/<contract_name>.wasm --network testnet
```
