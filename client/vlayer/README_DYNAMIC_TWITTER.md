# Dynamic Twitter Verification Frontend

A modern React frontend for the Dynamic Twitter Verification system, built with vlayer's Web Proof technology.

## Overview

This frontend application allows users to:

- Select multiple Twitter actions to verify (follow users, like posts, retweet content, etc.)
- Generate cryptographic proofs for their selected actions
- Submit proofs to the blockchain for on-chain verification
- Track their verification history and status

## Features

### 🎯 Multi-Action Selection

- Choose from various Twitter actions: profile verification, following users, liking posts, retweeting
- Dynamic form validation based on action requirements
- Intuitive toggle interface for enabling/disabling actions

### 🔐 Proof Generation

- Sequential proof generation for multiple actions
- Real-time progress tracking
- Integration with vlayer browser extension
- Automatic proof storage and management

### ⛓️ Blockchain Verification

- Single or batch verification options
- Gas-optimized batch transactions
- Real-time transaction status updates
- Comprehensive error handling

### 📊 User Experience

- Modern, responsive UI with Tailwind CSS
- Step-by-step guided workflow
- Progress indicators and status feedback
- Mobile-friendly design (desktop recommended)

## Architecture

### Components Structure

```
src/
├── components/
│   └── organisms/
│       ├── ActionSelectionStep/     # Action selection interface
│       ├── ProveStep/              # Proof generation
│       ├── VerifyStep/             # Blockchain verification
│       ├── WelcomeStep/            # Landing page
│       ├── ConnectWalletStep/      # Wallet connection
│       └── SuccessStep/            # Completion page
├── hooks/
│   └── useDynamicTwitterProof.ts   # Main verification logic
└── utils/
    └── steps.ts                    # Navigation configuration
```

### Key Components

#### ActionSelectionStep

- **Container.tsx**: Manages action selection state and validation
- **Presentational.tsx**: UI for selecting and configuring actions
- Features toggle switches, input validation, and dynamic form fields

#### ProveStep

- **Container.tsx**: Orchestrates proof generation for multiple actions
- **Presentational.tsx**: Progress tracking and status display
- Handles sequential proof generation with visual feedback

#### VerifyStep

- **Container.tsx**: Manages blockchain transaction submission
- **Presentational.tsx**: Verification options and status display
- Supports both single and batch verification modes

### Hooks

#### useDynamicTwitterProof

Main hook for handling Twitter action verification:

```typescript
export const useDynamicTwitterProof = (
  actionType: ActionType,
  targetValue?: string
) => {
  // Returns proof generation state and functions
  return {
    requestWebProof,
    webProof,
    isPending,
    callProver,
    result,
    error,
    // ... other state
  };
};
```

#### useMultipleDynamicTwitterProof

Extended hook for handling multiple actions:

```typescript
export const useMultipleDynamicTwitterProof = (
  actions: Array<{ actionType: ActionType; targetValue?: string }>
) => {
  // Returns multi-action state with progress tracking
  return {
    currentAction,
    currentActionIndex,
    totalActions,
    progress,
    isComplete,
    // ... inherited from single hook
  };
};
```

## Action Types

The system supports the following Twitter actions:

```typescript
enum ActionType {
  PROFILE_VERIFICATION = 0, // Verify Twitter profile ownership
  FOLLOW_USER = 1, // Prove following a specific user
  LIKE_POST = 2, // Prove liking a specific tweet
  RETWEET_POST = 3, // Prove retweeting a specific tweet
  REPLY_TO_POST = 4, // Prove replying to a specific tweet
  QUOTE_TWEET = 5, // Prove quote tweeting a specific tweet
}
```

Each action type has specific configuration:

- **Base URL**: API endpoint for verification
- **JSON Path**: Data extraction path from response
- **Expected Value**: Value to verify against
- **Target Value**: User-provided input (username, tweet ID, etc.)

## User Flow

### 1. Welcome Screen

- Introduction to the dynamic verification system
- Feature overview and benefits
- Mobile compatibility check

### 2. Wallet Connection

- Connect Web3 wallet (MetaMask, WalletConnect, etc.)
- Extension installation check
- Automatic navigation based on setup status

### 3. Action Selection

- Choose which Twitter actions to verify
- Configure target values (usernames, tweet IDs)
- Form validation and requirement checking
- Preview selected actions before proceeding

### 4. Proof Generation

- Sequential proof generation for each selected action
- Real-time progress tracking
- vlayer browser extension integration
- Automatic proof storage in localStorage

### 5. Blockchain Verification

- Choose between single or batch verification
- Gas estimation and optimization
- Transaction submission and monitoring
- Error handling and retry mechanisms

### 6. Success Confirmation

- Transaction confirmation display
- Verification summary
- Links to blockchain explorer
- Option to verify additional actions

## Configuration

### Environment Variables

```bash
VITE_PROVER_ADDRESS=0x...          # Dynamic Twitter Prover contract
VITE_VERIFIER_ADDRESS=0x...        # Dynamic Twitter Verifier contract
VITE_CHAIN_NAME=sepolia            # Target blockchain network
VITE_PROVER_URL=https://...        # vlayer prover service URL
VITE_JSON_RPC_URL=https://...      # Blockchain RPC endpoint
VITE_NOTARY_URL=https://...        # Notary service URL
VITE_WS_PROXY_URL=wss://...        # WebSocket proxy URL
VITE_VLAYER_API_TOKEN=...          # vlayer API authentication
VITE_GAS_LIMIT=500000              # Transaction gas limit
```

### Action Configuration

Actions are configured in `useDynamicTwitterProof.ts`:

```typescript
export const AVAILABLE_ACTIONS: Record<ActionType, ActionConfig> = {
  [ActionType.FOLLOW_USER]: {
    actionType: ActionType.FOLLOW_USER,
    baseUrl: "https://api.x.com/1.1/friendships/show.json",
    jsonPath: "relationship.source.following",
    expectedValue: "true",
    isActive: true,
  },
  // ... other actions
};
```

## Development

### Prerequisites

- Node.js 18+
- Bun or npm
- vlayer browser extension
- Web3 wallet

### Installation

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Deploy contracts (if needed)
bun run deploy:dev

# Start development server
bun run web:dev
```

### Available Scripts

```bash
# Development
bun run web:dev          # Start dev server with contract deployment
bun run web:testnet      # Start with testnet contracts
bun run web:mainnet      # Start with mainnet contracts

# Building
bun run build           # Build for production
bun run preview         # Preview production build

# Contract Management
bun run deploy:dev      # Deploy to development network
bun run deploy:testnet  # Deploy to testnet
bun run deploy:mainnet  # Deploy to mainnet

# Testing
bun run test:unit       # Run unit tests
bun run test-web:dev    # Run end-to-end tests
```

### Development Workflow

1. **Contract Development**: Update contracts in `../src/vlayer/`
2. **Frontend Updates**: Modify components and hooks
3. **Testing**: Use development environment for testing
4. **Deployment**: Deploy contracts and update environment variables

## Integration Guide

### Adding New Action Types

1. **Update Enum**: Add new action to `ActionType` enum
2. **Configure Action**: Add configuration to `AVAILABLE_ACTIONS`
3. **Update UI**: Add action to selection interface
4. **Test Integration**: Verify proof generation and verification

Example:

```typescript
// 1. Add to enum
enum ActionType {
  // ... existing actions
  MENTION_USER = 6,
}

// 2. Add configuration
[ActionType.MENTION_USER]: {
  actionType: ActionType.MENTION_USER,
  baseUrl: "https://api.x.com/1.1/statuses/mentions_timeline.json",
  jsonPath: "text",
  expectedValue: "@targetuser",
  isActive: true,
},

// 3. Update UI helpers
const getActionDescription = (actionType: ActionType): string => {
  switch (actionType) {
    // ... existing cases
    case ActionType.MENTION_USER:
      return "Prove you mentioned a specific user";
  }
};
```

### Custom Verification Logic

For complex verification requirements:

```typescript
// Custom verification function
const customVerifyAction = async (
  webProof: WebProof,
  actionConfig: ActionConfig,
  targetValue: string
): Promise<boolean> => {
  const web = webProof.verify(actionConfig.baseUrl);
  const data = web.jsonGetString(actionConfig.jsonPath);

  // Custom logic here
  return customValidation(data, targetValue);
};
```

## Troubleshooting

### Common Issues

1. **Extension Not Detected**

   - Ensure vlayer browser extension is installed
   - Check extension permissions
   - Refresh page after installation

2. **Proof Generation Fails**

   - Verify Twitter login status
   - Check network connectivity
   - Ensure target values are correct

3. **Transaction Failures**

   - Check wallet balance for gas fees
   - Verify contract addresses
   - Ensure network compatibility

4. **Action Validation Errors**
   - Verify Twitter action was actually performed
   - Check target value format (username vs tweet ID)
   - Ensure account has required permissions

### Debug Mode

Enable debug logging:

```bash
DEBUG=vlayer:* bun run web:dev
```

### Support

- Check vlayer documentation
- Review contract events for verification details
- Use browser developer tools for frontend debugging
- Monitor network requests for API issues

## Security Considerations

- **Private Keys**: Never expose private keys in frontend code
- **API Tokens**: Use environment variables for sensitive data
- **Input Validation**: Validate all user inputs before processing
- **Proof Verification**: Always verify proofs on-chain
- **Rate Limiting**: Implement appropriate rate limiting for API calls

## Performance Optimization

- **Batch Operations**: Use batch verification for multiple actions
- **Caching**: Cache proof data in localStorage
- **Lazy Loading**: Load components on demand
- **Gas Optimization**: Optimize contract calls for gas efficiency

## Future Enhancements

- **Mobile Support**: Full mobile compatibility
- **Advanced Analytics**: Detailed verification statistics
- **Social Features**: Share verification achievements
- **API Integration**: REST API for external integrations
- **Multi-Platform**: Support for other social platforms
