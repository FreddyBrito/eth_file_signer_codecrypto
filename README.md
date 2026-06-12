# ETH Document Signer

Decentralized application (dApp) for storing and verifying document authenticity on Ethereum.

## Features

- Upload documents and calculate cryptographic hash (keccak256)
- Digitally sign document hashes
- Store hash + signature + timestamp on blockchain
- Verify authenticity by comparing hash and signature
- View document history
- Drag & drop file upload
- Dark mode toggle

## Tech Stack

- **Smart Contracts**: Solidity + Foundry
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Blockchain Interaction**: Ethers.js v6
- **Local Network**: Anvil (Foundry)

## Project Structure

```
eth_file_signer_codecrypto/
├── sc/                    # Smart contracts (Foundry)
│   ├── src/               # Contract source
│   ├── test/              # Unit + integration tests
│   └── script/            # Deploy scripts
└── dapp/                  # Frontend (Next.js)
    ├── app/               # Pages and layout
    ├── components/        # React components
    ├── contexts/          # Wallet context
    ├── hooks/             # Contract hooks
    └── contracts/         # Contract ABI
```

## Prerequisites

- Node.js v18+
- Foundry (Forge, Cast, Anvil)
- Git

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Quick Start

### 1. Start Local Blockchain (Terminal 1)

```bash
anvil
```

### 2. Deploy Smart Contract (Terminal 2)

```bash
cd sc
forge script script/Deploy.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Copy the deployed contract address and update `dapp/.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x<deployed-address>
```

### 3. Start Frontend (Terminal 3)

```bash
cd dapp
npm install
npm run dev
```

Open http://localhost:3000

## Usage

1. **Connect Wallet** - Select a wallet from the dropdown and click "Connect"
2. **Upload & Sign** - Upload a file, sign it, and store on blockchain
3. **Verify** - Upload a file and enter signer address to verify authenticity
4. **History** - View all stored documents

## Testing

```bash
cd sc
forge test -vv        # Run all tests
forge coverage        # View coverage report
```

## Environment Variables

`dapp/.env.local`:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed contract address | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| `NEXT_PUBLIC_RPC_URL` | Ethereum RPC endpoint | `http://localhost:8545` |
| `NEXT_PUBLIC_CHAIN_ID` | Network chain ID | `31337` |
| `NEXT_PUBLIC_MNEMONIC` | HD wallet mnemonic | `test test test...junk` |

## License

MIT
