#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SC_DIR="$SCRIPT_DIR/sc"
DAPP_DIR="$SCRIPT_DIR/dapp"
RPC_URL="http://localhost:8545"
PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
ANVIL_PID=""

cleanup() {
  if [[ -n "$ANVIL_PID" ]]; then
    echo ""
    echo "stopping anvil (PID $ANVIL_PID)..."
    kill "$ANVIL_PID" 2>/dev/null || true
    wait "$ANVIL_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

info()  { printf "\033[1;34m▸\033[0m %s\n" "$1"; }
ok()    { printf "\033[1;32m✓\033[0m %s\n" "$1"; }
err()   { printf "\033[1;31m✗\033[0m %s\n" "$1" >&2; exit 1; }

# ──── check deps ────
command -v forge >/dev/null 2>&1  || err "forge not found. Install Foundry: https://book.getfoundry.sh/getting-started/installation"
command -v anvil >/dev/null 2>&1   || err "anvil not found. Install Foundry: https://book.getfoundry.sh/getting-started/installation"
command -v node >/dev/null 2>&1    || err "node not found. Install Node.js v18+"

# ──── install dapp deps if needed ────
if [[ ! -d "$DAPP_DIR/node_modules" ]]; then
  info "installing dapp dependencies..."
  (cd "$DAPP_DIR" && npm install --silent)
  ok "dapp dependencies installed"
fi

# ──── start anvil ────
info "starting anvil on $RPC_URL ..."
anvil --silent &
ANVIL_PID=$!

# wait for anvil to be ready (max 10s)
for i in $(seq 1 20); do
  if curl -s -o /dev/null -w '' -X POST "$RPC_URL" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' 2>/dev/null; then
    ok "anvil is ready"
    break
  fi
  if [[ $i -eq 20 ]]; then
    err "anvil failed to start after 10s"
  fi
  sleep 0.5
done

# ──── deploy contract ────
info "deploying DocumentRegistry..."
DEPLOY_OUTPUT=$(cd "$SC_DIR" && \
  PRIVATE_KEY="$PRIVATE_KEY" \
  forge script script/Deploy.s.sol \
    --rpc-url "$RPC_URL" \
    --broadcast 2>&1)

CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -oE 'DocumentRegistry deployed at: (0x[0-9a-fA-F]{40})' | grep -oE '0x[0-9a-fA-F]{40}')

if [[ -z "$CONTRACT_ADDRESS" ]]; then
  echo "$DEPLOY_OUTPUT"
  err "failed to extract contract address from forge output"
fi

ok "DocumentRegistry deployed at $CONTRACT_ADDRESS"

# ──── update .env.local ────
ENV_FILE="$DAPP_DIR/.env.local"

update_env() {
  local key="$1" value="$2"
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    sed -i.bak "s|^${key}=.*|${key}=${value}|" "$ENV_FILE" && rm -f "$ENV_FILE.bak"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

if [[ ! -f "$ENV_FILE" ]]; then
  cat > "$ENV_FILE" <<EOF
NEXT_PUBLIC_CONTRACT_ADDRESS=${CONTRACT_ADDRESS}
NEXT_PUBLIC_RPC_URL=${RPC_URL}
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_MNEMONIC=test test test test test test test test test test test junk
EOF
  ok "created .env.local"
else
  update_env "NEXT_PUBLIC_CONTRACT_ADDRESS" "$CONTRACT_ADDRESS"
  update_env "NEXT_PUBLIC_RPC_URL" "$RPC_URL"
  ok "updated .env.local"
fi

# ──── start frontend ────
info "starting frontend..."
cd "$DAPP_DIR"
npm run dev
