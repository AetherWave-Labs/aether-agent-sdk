# Aether Agent SDK

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

An open-source TypeScript SDK enabling autonomous AI agents to execute x402 header payments, query decentralized RPC nodes, and manage smart contract escrow logic.

## System Architecture
[ AI Agent Framework (LangChain / LlamaIndex) ]
│
▼
[ Aether Agent SDK ]
┌──────────┴──────────┐
▼                     ▼
[ x402 Header Protocol ] [ Smart Contract Escrow ]

## Features

* **x402 Micropayments:** Automatic HTTP 402 header parsing and automated payment execution.
* **Multi-Chain RPC Client:** High-speed RPC abstractions for Soroban and EVM networks.
* **LangChain Integration:** Pre-built tools for autonomous agent actions.

## Quickstart

```bash
# Install dependencies
pnpm install

# Build SDK
pnpm build

# Run tests
pnpm test
