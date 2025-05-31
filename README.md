# 🏛️ DAO Governance & Verification System

A comprehensive decentralized autonomous organization (DAO) platform with advanced identity verification using **vlayer's Web Proof technology**. This system enables secure, privacy-preserving verification of social media accounts, email domains, and GitHub contributions to build reputation-based governance with sophisticated voting weight calculations.

## 🌟 Key Features

- **🗳️ Decentralized Governance**: Proposal creation, voting, and execution with reputation-weighted voting
- **🔐 Zero-Knowledge Verification**: Privacy-preserving identity proofs using vlayer
- **🐦 Twitter Verification**: Verify Twitter actions (follows, likes, retweets) with cryptographic proofs
- **📧 Email Domain Verification**: Prove email domain ownership through DKIM signatures
- **🐙 GitHub Contribution Verification**: Verify contributions to specific repositories
- **🏆 Advanced Reputation System**: Multi-dimensional reputation scoring with decay mechanisms
- **⚖️ Sophisticated Voting Weights**: Complex formula balancing reputation, tokens, and participation
- **⚡ Real-time Updates**: Live transaction and contract state monitoring
- **🛡️ Sybil Resistance**: Multi-factor verification prevents fake accounts
- **📊 Analytics Dashboard**: Comprehensive governance and reputation analytics

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

## ⚖️ Advanced Voting Weight Formula

Our DAO implements a sophisticated voting weight calculation that prioritizes reputation while incorporating token holdings and participation metrics. This creates a balanced governance system that rewards genuine contribution over pure capital.

### 🧮 Mathematical Formula

The voting weight for each participant is calculated using the following complex formula:

```
VW = (R^α × T^β × P^γ × V^δ × D^ε) × M × S

Where:
VW = Final Voting Weight
R  = Reputation Score (0-10,000)
T  = Token Holdings (normalized)
P  = Participation Rate (0-1)
V  = Verification Diversity Score (0-1)
D  = Domain Authority Score (0-1)
M  = Multiplier based on proposal category
S  = Sybil resistance factor (0-1)

Exponents (emphasizing reputation):
α = 2.5  (Reputation - primary factor)
β = 0.8  (Token holdings - secondary)
γ = 1.2  (Participation - important)
δ = 1.0  (Verification diversity)
ε = 0.6  (Domain authority)
```

### 📊 Component Breakdown

#### 🏆 Reputation Score (R)

```
R = Σ(Vi × Wi × Di) + B

Where:
Vi = Verification type score
Wi = Weight for verification type
Di = Decay factor based on age
B  = Base reputation bonus

Verification Weights:
- GitHub Contributions: 100 points × commit_count^0.5
- Twitter Verification: 50 points × follower_tier
- Email Domain: 75 points × domain_authority
- Participation: 25 points × proposal_votes
```

#### 💰 Token Holdings (T - Normalized)

```
T = min(1, token_balance / token_cap)

Where:
token_cap = 10,000 tokens (prevents whale dominance)
```

#### 📈 Participation Rate (P)

```
P = (votes_cast / total_proposals) × (1 + early_voter_bonus)

Where:
early_voter_bonus = 0.2 if voted within first 24 hours
```

#### 🔐 Verification Diversity Score (V)

```
V = (verified_platforms / total_platforms) × quality_multiplier

Where:
total_platforms = 3 (Twitter, GitHub, Email)
quality_multiplier = 1.5 if all verifications are recent
```

#### 🌐 Domain Authority Score (D)

```
D = Σ(domain_score × verification_strength)

Where:
domain_score ranges from 0.1 (new domains) to 1.0 (established domains)
```

#### 🎯 Category Multiplier (M)

```
M = {
  1.5  for Technical proposals (GitHub verification weighted higher)
  1.3  for Community proposals (Twitter verification weighted higher)
  1.2  for Financial proposals (Token holdings weighted higher)
  1.0  for General proposals (Standard weighting)
}
```

#### 🛡️ Sybil Resistance Factor (S)

```
S = min(1, account_age_days / 90) × verification_strength × unique_activity_score

Where:
verification_strength = number of unique verification types / 3
unique_activity_score = based on cross-platform activity correlation
```

### 📈 Example Calculation

For a user with:

- Reputation: 2,500 points
- Tokens: 5,000 (normalized to 0.5)
- Participation: 0.8 (80% of proposals voted)
- Verification Diversity: 1.0 (all platforms verified)
- Domain Authority: 0.7
- Technical proposal (M = 1.5)
- Sybil factor: 0.9

```
VW = (2500^2.5 × 0.5^0.8 × 0.8^1.2 × 1.0^1.0 × 0.7^0.6) × 1.5 × 0.9
VW = (98,821,373 × 0.574 × 0.758 × 1.0 × 0.827) × 1.5 × 0.9
VW = 29,654,321 × 1.35
VW ≈ 40,033,333 voting weight units
```

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
- **Follower Count Tiers**: Different reputation based on follower count
- **Account Age Verification**: Older accounts receive higher trust scores

#### 📧 Email Domain Verification

- **DKIM Signature Verification**: Cryptographically prove email domain ownership
- **Domain Authority**: Establish credibility through verified email domains
- **Privacy-Preserving**: Email content remains private, only domain ownership is proven
- **Corporate Domain Bonus**: Higher reputation for verified corporate domains
- **Multi-Domain Support**: Verify multiple email domains for increased reputation

#### 🐙 GitHub Contribution Verification

- **Repository Contributions**: Prove contributions to specific GitHub repositories
- **Branch-Specific Verification**: Verify contributions to particular branches
- **Developer Reputation**: Build technical credibility through verified open-source contributions
- **Commit Quality Analysis**: Reputation based on commit size and frequency
- **Repository Popularity**: Higher scores for contributions to popular repositories
- **Example Repository**: Supports verification for repositories like `covalenthq/cxt-ai` on `main` branch

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

## 🏛️ Governance Mechanics

### 📋 Proposal Types

1. **Technical Proposals**: Protocol upgrades, smart contract changes
2. **Financial Proposals**: Treasury management, funding allocation
3. **Community Proposals**: Community guidelines, moderation policies
4. **Parameter Proposals**: Voting weight adjustments, reputation parameters

### ⏱️ Voting Phases

1. **Submission Phase** (24 hours): Proposal submission and initial review
2. **Discussion Phase** (72 hours): Community discussion and amendments
3. **Voting Phase** (120 hours): Active voting period
4. **Execution Phase** (24 hours): Automatic execution if passed

### 🎯 Quorum Requirements

- **Technical Proposals**: 15% of total voting weight
- **Financial Proposals**: 20% of total voting weight
- **Community Proposals**: 10% of total voting weight
- **Parameter Proposals**: 25% of total voting weight

## 🏆 Reputation System Details

### 📊 Reputation Categories

#### 🔧 Technical Reputation

- GitHub contributions: 1-500 points per repository
- Code quality metrics: Bonus multipliers
- Open source project leadership: 1000+ point bonuses

#### 🌐 Social Reputation

- Twitter engagement: 1-100 points per verification
- Community participation: 10-50 points per meaningful interaction
- Content quality: Algorithmic scoring based on engagement

#### 💼 Professional Reputation

- Email domain authority: 50-200 points
- Corporate verification: 500+ point bonuses
- Industry recognition: Manual verification bonuses

### ⏰ Reputation Decay

Reputation scores decay over time to ensure active participation:

```
Current_Reputation = Base_Reputation × e^(-λt)

Where:
λ = 0.001 (decay constant)
t = days since last activity
```

## 🛠️ Development Setup

### Prerequisites

- **Foundry**: Ethereum development toolkit
- **Node.js**: v18+ for frontend development
- **vlayer SDK**: For web proof generation
- **Docker**: For local development environment

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

# Setup local development environment
docker-compose up -d
```

### Environment Variables

Create a `.env` file in the `client/vlayer` directory:

```env
# Network Configuration
VITE_CHAIN_NAME=baseSepolia
VITE_GAS_LIMIT=1000000

# Contract Addresses (Updated)
VITE_PROVER_ADDRESS=0x015153cE7E18694DF9338B3a96639758869B946f
VITE_VERIFIER_ADDRESS=0x3629B85DF620379446459260c9F7f4aBa7Bf232D
VITE_GITHUB_PROVER_ADDRESS=0x034dD3349C10e5ce82C18c245DF7B92E731399e9
VITE_GITHUB_VERIFIER_ADDRESS=0xA0055d73C412B662971491535213ad6AcB9ba959
VITE_EMAIL_PROVER_ADDRESS=0x05b64aDfaF19231578557C026CBb1E2f3c96CC7e
VITE_EMAIL_VERIFIER_ADDRESS=0xdDa172Fd63d4903dB859a4A67Ea4AC0A6BE35886

# API Configuration
VITE_BE_API_URL=<your-backend-api-url>
VITE_VLAYER_API_TOKEN=<your-vlayer-api-token>

# Analytics & Monitoring
VITE_ANALYTICS_ENABLED=true
VITE_SENTRY_DSN=<your-sentry-dsn>
```

## 🚀 Usage

### Building and Testing

```shell
# Build contracts
cd client
forge build

# Run comprehensive tests
forge test -vvv

# Run specific test suites
forge test --match-contract GovernanceTest
forge test --match-contract ReputationTest

# Format code
forge fmt

# Generate gas snapshots
forge snapshot

# Security analysis
slither .
```

### Contract Verification

All contracts were verified using Foundry's forge verify-contract command with Blockscout:

```bash
# GitHub Prover Verification
forge verify-contract \
  --rpc-url https://sepolia.base.org \
  --verifier blockscout \
  --verifier-url 'https://base-sepolia.blockscout.com/api/' \
  0x034dD3349C10e5ce82C18c245DF7B92E731399e9 \
  src/vlayer/GitHubProver.sol:GitHubProver

# GitHub Verifier Verification
forge verify-contract \
  --rpc-url https://sepolia.base.org \
  --verifier blockscout \
  --verifier-url 'https://base-sepolia.blockscout.com/api/' \
  0xA0055d73C412B662971491535213ad6AcB9ba959 \
  src/vlayer/GitHubVerifier.sol:GitHubVerifier
```

### Frontend Development

```bash
# Start development server
cd client/vlayer
npm run web:dev

# Build for production
npm run build

# Run tests
npm run test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🌐 Network Information

- **Network**: Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: `https://sepolia.base.org`
- **Block Explorer**: [Base Sepolia Blockscout](https://base-sepolia.blockscout.com/)
- **Faucet**: [Base Sepolia Faucet](https://faucet.quicknode.com/base/sepolia)

## 🔧 GitHub Proof Verification

The GitHub proof verification system allows users to prove their contributions to specific repositories without revealing sensitive information. Here's how it works:

### 🎯 Verification Process

1. **Repository Selection**: Choose a GitHub repository and branch to verify contributions for
2. **Web Proof Generation**: Use vlayer extension to generate cryptographic proof of GitHub activity
3. **On-Chain Verification**: Submit proof to the GitHubVerifier contract for validation
4. **Reputation Earning**: Gain reputation points for verified contributions

### 🔍 Supported Verification

- **Commit History**: Verify contributions to specific branches
- **Repository Access**: Prove access to private or public repositories
- **Contribution Metrics**: Validate commit counts and activity levels
- **Privacy-Preserving**: Only contribution existence is proven, not content details

### 🛠️ Technical Implementation

The GitHub verification uses vlayer's Web Proof technology to:

- Generate proofs from GitHub's commit API endpoints
- Verify HTTPS responses cryptographically
- Ensure data integrity without revealing private information
- Enable trustless verification on Base Sepolia

## 🔒 Security Considerations

### 🛡️ Smart Contract Security

- **Multi-signature governance**: Critical functions require multiple signatures
- **Time locks**: Sensitive operations have mandatory delay periods
- **Upgrade patterns**: Transparent proxy pattern for safe upgrades
- **Access controls**: Role-based permissions for different functions

### 🔐 Privacy Protection

- **Zero-knowledge proofs**: No sensitive data exposed on-chain
- **Data minimization**: Only necessary information is processed
- **Encryption**: All off-chain communications are encrypted
- **GDPR compliance**: Right to be forgotten implementation

### 🚨 Attack Mitigation

- **Sybil resistance**: Multi-factor verification prevents fake accounts
- **Flash loan protection**: Voting weights calculated over time periods
- **Governance attacks**: Quorum requirements and time delays
- **Front-running protection**: Commit-reveal schemes for sensitive votes

## 📊 Analytics & Monitoring

### 📈 Key Metrics

- **Governance participation rates**
- **Reputation distribution analysis**
- **Voting weight concentration**
- **Proposal success rates**
- **User engagement metrics**

### 🔍 Monitoring Tools

- **Real-time dashboards**: Grafana-based monitoring
- **Alert systems**: Automated notifications for anomalies
- **Performance tracking**: Gas usage and transaction costs
- **Security monitoring**: Unusual activity detection

## 📚 Documentation

- **Foundry**: https://book.getfoundry.sh/
- **vlayer**: https://docs.vlayer.xyz/
- **Base**: https://docs.base.org/
- **Blockscout**: https://docs.blockscout.com/
- **OpenZeppelin**: https://docs.openzeppelin.com/

## 🤝 Contributing

### 🔄 Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add comprehensive tests
5. Run the full test suite
6. Submit a pull request

### 📝 Contribution Guidelines

- **Code style**: Follow Solidity and TypeScript best practices
- **Testing**: Maintain >95% test coverage
- **Documentation**: Update relevant documentation
- **Security**: Consider security implications of all changes

### 🏗️ Architecture Decisions

- **ADR-001**: Reputation-weighted voting system
- **ADR-002**: vlayer integration for privacy-preserving verification
- **ADR-003**: Base Sepolia deployment strategy
- **ADR-004**: Blockscout integration for transparency

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 ETH Prague 2024

This project was developed for ETH Prague 2024, showcasing the integration of vlayer's Web Proof technology with DAO governance systems to create a new paradigm for reputation-based decentralized governance.

### 🎯 Innovation Highlights

- **Novel voting weight formula** balancing reputation and token holdings
- **Privacy-preserving verification** using cutting-edge cryptographic proofs
- **Multi-platform reputation** aggregating trust across different services
- **Sybil-resistant governance** preventing manipulation and fake accounts
- **Transparent analytics** providing insights into governance health

### 🌟 Future Roadmap

- **Cross-chain governance**: Expand to multiple blockchain networks
- **AI-powered reputation**: Machine learning for reputation scoring
- **Mobile applications**: Native mobile apps for easier participation
- **Enterprise integration**: Corporate governance use cases
- **Regulatory compliance**: Frameworks for regulated environments
