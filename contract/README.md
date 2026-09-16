# Smart Contracts

On-chain policy enforcement contracts for Stellar/Soroban and EVM networks.

## Soroban (Stellar)

Rust-based smart contract for on-chain policy enforcement on Stellar.

### Setup

```bash
# Install Rust and Soroban CLI
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install --locked soroban-cli

# Build
cd soroban
cargo build --target wasm32-unknown-unknown --release

# Deploy to testnet
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/policy_guard.wasm --network testnet
```

### Contract Methods

- `set_policy(agent, max_amount_per_tx, daily_spending_limit, require_memo)` - Set agent policy
- `get_policy(agent)` - Get agent policy
- `check_transaction(agent, amount, has_memo)` - Check if transaction passes policy
- `record_transaction(agent, amount)` - Record completed transaction
- `get_spending(agent)` - Get daily spending record

## EVM (Solidity)

Solidity-based smart contract for cross-chain policy enforcement.

### Setup

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash

# Build
cd evm
forge build

# Test
forge test

# Deploy
forge create src/PolicyGuard.sol:PolicyGuard --rpc-url $RPC_URL
```

### Contract Methods

- `setPolicy(maxAmountPerTx, dailySpendingLimit, requireMemo)` - Set caller's policy
- `checkTransaction(amount, hasMemo)` - Check if transaction passes policy
- `recordTransaction(amount)` - Record completed transaction
- `getSpending(day)` - Get daily spending record
