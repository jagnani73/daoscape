# 🏛️ DAO Governance & Verification System

A comprehensive decentralized autonomous organization (DAO) platform with advanced identity verification using **vlayer's Web Proof technology**. This system enables secure, privacy-preserving verification of social media accounts, email domains, and GitHub contributions to build reputation-based governance.

## 🌟 Key Features

- **🗳️ Decentralized Governance**: Proposal creation, voting, and execution
- **🔐 Zero-Knowledge Verification**: Privacy-preserving identity proofs using vlayer
- **🐦 Twitter Verification**: Verify Twitter actions (follows, likes, retweets) with cryptographic proofs
- **📧 Email Domain Verification**: Prove email domain ownership through DKIM signatures
- **🐙 GitHub Contribution Verification**: Verify contributions to specific repositories
- **🏆 Reputation System**: Earn reputation points through verified activities
- **⚡ Real-time Updates**: Live transaction and contract state monitoring

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
| **GitHubProver**           | `0x034dD3349C10e5ce82C18c245DF7B92E731399e9` | [View on Blockscout](https://base-sepolia.blockscout.com/address/0x034dD3349C10e5ce82C18c245DF7B92E731399e9) | Prover contract for GitHub contribution verification    |
| **GitHubVerifier**         | `0xA0055d73C412B662971491535213ad6AcB9ba959` | [View on Blockscout](https://base-sepolia.blockscout.com/address/0xA0055d73C412B662971491535213ad6AcB9ba959) | Verifier contract for GitHub repository contributions   |

## 🔧 vlayer Web Proof Technology

This project leverages **vlayer's cutting-edge Web Proof technology** to enable privacy-preserving verification of web-based activities:

### 🛡️ How It Works

1. **Web Proof Generation**: Users generate cryptographic proofs of their web activities (Twitter actions, email ownership, GitHub contributions)
2. **Zero-Knowledge Verification**: Proofs are verified on-chain without revealing sensitive information
3. **Reputation Building**: Verified activities earn reputation points in the DAO
4. **Governance Participation**: Higher reputation increases voting power and influence

### 🎯 Supported Verification Types

#### 🐦 Twitter Verification

- **Profile Verification**: Prove ownership of a Twitter account
- **Follow Verification**: Prove you follow specific accounts
- **Like Verification**: Prove you liked specific tweets
- **Retweet Verification**: Prove you retweeted specific content

#### 📧 Email Domain Verification

- **DKIM Signature Verification**: Cryptographically prove email domain ownership
- **Domain Authority**: Establish credibility through verified email domains
- **Privacy-Preserving**: Email content remains private, only domain ownership is proven

#### 🐙 GitHub Contribution Verification

- **Repository Contributions**: Prove contributions to specific GitHub repositories
- **Branch-Specific Verification**: Verify contributions to particular branches
- **Developer Reputation**: Build technical credibility through verified open-source contributions
- **Example Repository**: Supports verification for repositories like `covalenthq/ai-agent-sdk` on `deferred_commit_contributors` branch

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   vlayer        │    │   Blockchain    │
│   (React)       │◄──►│   Web Proofs    │◄──►│   (Base)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └─────────────►│   DAO Backend   │◄─────────────┘
                        │   (API)         │
                        └─────────────────┘
```

### 🔍 Blockscout Integration

We've chosen **Blockscout** as our primary block explorer for the following reasons:

- ✅ **Open Source**: Fully transparent and community-driven
- ✅ **Advanced Analytics**: Comprehensive contract interaction tracking
- ✅ **Developer Friendly**: Excellent API and verification tools
- ✅ **Multi-chain Support**: Consistent experience across different networks
- ✅ **Real-time Updates**: Live transaction and contract state monitoring

## 🛠️ Development Setup

### Prerequisites

- **Foundry**: Ethereum development toolkit
- **Node.js**: v18+ for frontend development
- **vlayer SDK**: For web proof generation

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd eth-prague

# Install Foundry dependencies
cd client
forge install

# Install frontend dependencies
cd vlayer
npm install
```

### Environment Variables

Create a `.env` file in the `client/vlayer` directory:

```env
# Network Configuration
VITE_CHAIN_NAME=baseSepolia
VITE_GAS_LIMIT=1000000

# Contract Addresses
VITE_PROVER_ADDRESS=0x015153cE7E18694DF9338B3a96639758869B946f
VITE_VERIFIER_ADDRESS=0x3629B85DF620379446459260c9F7f4aBa7Bf232D
VITE_GITHUB_PROVER_ADDRESS=0x034dD3349C10e5ce82C18c245DF7B92E731399e9
VITE_GITHUB_VERIFIER_ADDRESS=0xA0055d73C412B662971491535213ad6AcB9ba959
VITE_EMAIL_PROVER_ADDRESS=0x05b64aDfaF19231578557C026CBb1E2f3c96CC7e
VITE_EMAIL_VERIFIER_ADDRESS=0xdDa172Fd63d4903dB859a4A67Ea4AC0A6BE35886

# API Configuration
VITE_BE_API_URL=<your-backend-api-url>
```
