# EVM Smart Contracts

This folder contains Solidity smart contracts for EVM-compatible networks (Ethereum, Arbitrum, Optimism, Base, Polygon).

## Tooling

Compatible with Foundry and Hardhat:

- `solidity`: `^0.8.24`
- `foundry` / `forge`
- `hardhat`

## Typical Workflow

```bash
# Compile contracts
forge build

# Run contract tests
forge test

# Deploy with Foundry script
forge script script/Deploy.s.sol --rpc-url <RPC_URL> --broadcast
```
