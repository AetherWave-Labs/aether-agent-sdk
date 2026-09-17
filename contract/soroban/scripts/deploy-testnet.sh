#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTRACT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${CONTRACT_DIR}"

if [[ -f ".env" ]]; then
    set -a
    # shellcheck disable=SC1091
    source ".env"
    set +a
fi

: "${STELLAR_NETWORK:=testnet}"
: "${STELLAR_SOURCE_ACCOUNT:?STELLAR_SOURCE_ACCOUNT must be set}"
: "${STELLAR_CONTRACT_ALIAS:=policy_guard}"

WASM_PATH="target/wasm32v1-none/release/policy_guard.wasm"

if [[ ! -f "${WASM_PATH}" ]]; then
    echo "WASM artifact not found."
    echo "Run: stellar contract build"
    exit 1
fi

if [[ "${STELLAR_NETWORK}" != "testnet" ]]; then
    echo "This script is restricted to the Stellar testnet."
    echo "STELLAR_NETWORK=${STELLAR_NETWORK}"
    exit 1
fi

echo "Deploying policy_guard to Stellar testnet..."
echo "Source identity: ${STELLAR_SOURCE_ACCOUNT}"
echo "Alias: ${STELLAR_CONTRACT_ALIAS}"

stellar contract deploy \
    --wasm "${WASM_PATH}" \
    --source-account "${STELLAR_SOURCE_ACCOUNT}" \
    --network "${STELLAR_NETWORK}" \
    --alias "${STELLAR_CONTRACT_ALIAS}"
