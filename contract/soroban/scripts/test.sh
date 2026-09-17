#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTRACT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${CONTRACT_DIR}"

echo "Running Rust formatting check..."
cargo fmt -- --check

echo "Running Soroban tests..."
cargo test

echo "Building optimized Soroban WASM..."
stellar contract build

echo
echo "Soroban workspace validation completed successfully."
