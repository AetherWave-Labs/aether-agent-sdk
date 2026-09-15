# Aether Agent Backend Service

This directory contains the backend integration services, webhook dispatchers, and state persistence layers for the Aether Agent infrastructure.

## Structure & Architecture

The backend layer is designed to support:

- **Agent Orchestrator API**: REST/GraphQL endpoints for coordinating multi-agent workflows.
- **Webhook & Event Handlers**: Ingesting on-chain transaction lifecycle events and alerts.
- **Key & Policy Management Service**: Secure custodial or MPC signer bridges and enterprise policy limits.
- **Relayer & Gas Subsidizer**: Gasless transaction relaying for agent operations.

## Getting Started

Backend components can leverage `@aetherwave/aether-agent-sdk` directly as an imported module.

```bash
# Example setup when service dependencies are added
npm install
npm run dev
```
