# Smart Contracts

This directory contains smart contract definitions, interfaces, test suites, and deployment scripts for protocols interacting with `aether-agent-sdk`.

## Subdirectories

- [`soroban/`](./soroban/): Rust-based smart contracts for Stellar Soroban runtime.
- [`evm/`](./evm/): Solidity/Hardhat/Foundry smart contracts for EVM-compatible networks.

## Integration Architecture

Smart contracts deployed in these folders are targeted by the SDK adapters located in `src/chains/stellar/contracts.ts` and `src/chains/evm/contracts.ts`.
