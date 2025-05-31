## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## 🚀 Deployed Contracts on Base Sepolia

Our smart contracts have been successfully deployed and verified on Base Sepolia testnet. All contracts are verified on **Blockscout** for transparency and easy interaction.

### 📋 Contract Addresses & Verification

| Contract                   | Address                                      | Blockscout Link                                                                                              | Description                                             |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| **Governance**             | `0x9A7bA3DdAE013eAc11f21EcabDb81bF339874383` | [View on Blockscout](https://base-sepolia.blockscout.com/address/0x9A7bA3DdAE013eAc11f21EcabDb81bF339874383) | Main governance contract for DAO proposals and voting   |
| **DynamicTwitterProver**   | `0x015153cE7E18694DF9338B3a96639758869B946f` | [View on Blockscout](https://base-sepolia.blockscout.com/address/0x015153cE7E18694DF9338B3a96639758869B946f) | Prover contract for Twitter verification using vlayer   |
| **DynamicTwitterVerifier** | `0x3629B85DF620379446459260c9F7f4aBa7Bf232D` | [View on Blockscout](https://base-sepolia.blockscout.com/address/0x3629B85DF620379446459260c9F7f4aBa7Bf232D) | Verifier contract for Twitter actions and social proof  |
| **EmailDomainProver**      | `0x05b64aDfaF19231578557C026CBb1E2f3c96CC7e` | [View on Blockscout](https://base-sepolia.blockscout.com/address/0x05b64aDfaF19231578557C026CBb1E2f3c96CC7e) | Prover contract for email domain verification           |
| **EmailDomainVerifier**    | `0xdDa172Fd63d4903dB859a4A67Ea4AC0A6BE35886` | [View on Blockscout](https://base-sepolia.blockscout.com/address/0xdDa172Fd63d4903dB859a4A67Ea4AC0A6BE35886) | Verifier contract for email-based identity verification |

### 🔍 Blockscout Integration

We've chosen **Blockscout** as our primary block explorer for the following reasons:

- ✅ **Open Source**: Fully transparent and community-driven
- ✅ **Advanced Analytics**: Comprehensive contract interaction tracking
- ✅ **Developer Friendly**: Excellent API and verification tools
- ✅ **Multi-chain Support**: Consistent experience across different networks
- ✅ **Real-time Updates**: Live transaction and contract state monitoring

### 🛠️ Verification Commands Used

All contracts were verified using Foundry's forge verify-contract command with Blockscout as the verifier:

```bash
# Example verification command
forge verify-contract \
  --rpc-url https://spring-indulgent-slug.base-sepolia.quiknode.pro/f3ba77eee6478e3d3a19eedb6ecacacd47ee8ead/ \
  <CONTRACT_ADDRESS> \
  <CONTRACT_PATH>:<CONTRACT_NAME> \
  --verifier blockscout \
  --verifier-url https://base-sepolia.blockscout.com/api/
```

### 🌐 Network Information

- **Network**: Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: `https://spring-indulgent-slug.base-sepolia.quiknode.pro/f3ba77eee6478e3d3a19eedb6ecacacd47ee8ead/`
- **Block Explorer**: [Base Sepolia Blockscout](https://base-sepolia.blockscout.com/)

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
