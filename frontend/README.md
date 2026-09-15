# Aether Agent Frontend & Management Dashboard

This directory contains the user interface, monitoring dashboard, and visual agent builder for managing autonomous agent operations across Stellar/Soroban and EVM networks.

## Features

- **Agent Dashboard**: Real-time monitoring of agent health, activity, and balance reserves.
- **Transaction Explorer**: Inspect pending, confirmed, and failed agent-initiated transactions.
- **Policy Configurator**: Visual policy editor for setting spending thresholds, allowlists, and execution boundaries.
- **Simulation Sandbox**: Interactive testing interface for simulating agent decisions against Soroban and EVM contracts.

## Getting Started

The frontend interacts with the backend services and uses `@aetherwave/aether-agent-sdk` for client-side state inspection.

```bash
# Example setup when frontend app is initialized
npm install
npm run dev
```
