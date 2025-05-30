# Dynamic Twitter Verification System

A comprehensive smart contract system for verifying multiple Twitter actions dynamically, built on vlayer's Web Proof technology.

## Overview

This system allows you to verify various Twitter actions such as:

- Following specific accounts
- Liking posts
- Retweeting posts
- Profile verification
- And more (easily extensible)

Instead of minting NFTs, the system tracks user data and verification history on-chain, making it perfect for building reputation systems, social proof mechanisms, and gamified applications.

## Architecture

### Core Components

1. **DynamicTwitterProver.sol** - Handles proof generation for various Twitter actions
2. **DynamicTwitterVerifier.sol** - Verifies proofs and tracks user data on-chain
3. **Deployment Scripts** - For easy contract deployment
4. **Comprehensive Tests** - Full test coverage for all functionality

### Key Features

- **Dynamic Action Configuration**: Add new verification types without redeploying contracts
- **Multi-Action Verification**: Verify multiple actions in a single transaction
- **Comprehensive User Tracking**: Track user verification history and statistics
- **Flexible Query System**: Rich API for frontend integration
- **Gas Optimized**: Efficient storage and computation patterns

## Contract Details

### DynamicTwitterProver

The prover contract handles the verification logic for different Twitter actions:

```solidity
enum ActionType {
    FOLLOW_USER,
    LIKE_POST,
    RETWEET_POST,
    REPLY_TO_POST,
    QUOTE_TWEET,
    PROFILE_VERIFICATION
}
```

#### Key Functions:

- `verifyAction()` - Verify a single action
- `verifyMultipleActions()` - Verify multiple actions at once
- `addActionConfig()` - Add new action types
- `updateActionConfig()` - Update existing action configurations
- `getAllActiveActions()` - Get all available actions

### DynamicTwitterVerifier

The verifier contract tracks user data and verification results:

#### Data Structures:

```solidity
struct UserData {
    string username;
    address userAddress;
    uint256 totalActionsVerified;
    uint256 lastVerificationTimestamp;
    bool isActive;
}

struct ActionRecord {
    uint256 actionId;
    string actionName;
    string targetValue;
    bool verified;
    uint256 timestamp;
    string actualValue;
}
```

#### Key Functions:

- `verifySingleAction()` - Process single action verification
- `verifyMultipleActions()` - Process multiple action verifications
- `getUserData()` - Get user information
- `getUserActionHistory()` - Get user's action history
- `getUsersWithAction()` - Find users who completed specific actions
- `getRecentActivity()` - Get recent verification activity

## Usage Examples

### 1. Verify User Follows a Specific Account

```solidity
// Action ID 1 = FOLLOW_USER
uint256 actionId = 1;
string memory username = "your_twitter_handle";
string memory targetAccount = "vitalikbuterin";
address userAddress = msg.sender;

// Generate proof (off-chain)
WebProof memory webProof = generateWebProof(actionId, username, targetAccount);

// Verify on-chain
verifier.verifySingleAction(
    proof,
    actionId,
    username,
    targetAccount,
    userAddress
);
```

### 2. Verify Multiple Actions at Once

```solidity
uint256[] memory actionIds = [1, 2, 3]; // Follow, Like, Retweet
string[] memory targetValues = ["vitalikbuterin", "1234567890", "1234567890"];

verifier.verifyMultipleActions(
    proofs,
    actionIds,
    username,
    targetValues,
    userAddress
);
```

### 3. Query User Data for Frontend

```solidity
// Get user summary
(
    string memory username,
    uint256 totalActions,
    uint256 lastVerification,
    bool[] memory actionStatuses
) = verifier.getUserActionSummary(userAddress);

// Get users who followed a specific account
address[] memory followers = verifier.getUsersWithAction(1);

// Get recent activity
(
    address[] memory users,
    uint256[] memory timestamps,
    uint256[] memory actionCounts
) = verifier.getRecentActivity(10);
```

## Frontend Integration

### JavaScript/TypeScript Example

```typescript
import { ethers } from "ethers";

class TwitterVerificationService {
  private verifierContract: ethers.Contract;
  private proverContract: ethers.Contract;

  constructor(
    verifierAddress: string,
    proverAddress: string,
    provider: ethers.Provider
  ) {
    this.verifierContract = new ethers.Contract(
      verifierAddress,
      VERIFIER_ABI,
      provider
    );
    this.proverContract = new ethers.Contract(
      proverAddress,
      PROVER_ABI,
      provider
    );
  }

  async getUserData(userAddress: string) {
    return await this.verifierContract.getUserData(userAddress);
  }

  async getUserActionSummary(userAddress: string) {
    return await this.verifierContract.getUserActionSummary(userAddress);
  }

  async getAvailableActions() {
    return await this.proverContract.getAllActiveActions();
  }

  async verifyAction(actionId: number, username: string, targetValue: string) {
    // Generate web proof (implementation depends on vlayer SDK)
    const webProof = await this.generateWebProof(
      actionId,
      username,
      targetValue
    );

    // Submit verification
    const tx = await this.verifierContract.verifySingleAction(
      webProof,
      actionId,
      username,
      targetValue,
      await this.signer.getAddress()
    );

    return await tx.wait();
  }

  private async generateWebProof(
    actionId: number,
    username: string,
    targetValue: string
  ) {
    // Implementation depends on vlayer SDK
    // This would generate the cryptographic proof of the Twitter action
  }
}
```

### React Component Example

```tsx
import React, { useState, useEffect } from "react";
import { TwitterVerificationService } from "./TwitterVerificationService";

const TwitterVerificationDashboard: React.FC = () => {
  const [userData, setUserData] = useState(null);
  const [availableActions, setAvailableActions] = useState([]);
  const [verificationService, setVerificationService] = useState(null);

  useEffect(() => {
    // Initialize service
    const service = new TwitterVerificationService(
      VERIFIER_ADDRESS,
      PROVER_ADDRESS,
      provider
    );
    setVerificationService(service);

    // Load user data
    loadUserData(service);
    loadAvailableActions(service);
  }, []);

  const loadUserData = async (service) => {
    try {
      const data = await service.getUserData(userAddress);
      setUserData(data);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const loadAvailableActions = async (service) => {
    try {
      const actions = await service.getAvailableActions();
      setAvailableActions(actions);
    } catch (error) {
      console.error("Error loading actions:", error);
    }
  };

  const handleVerifyAction = async (actionId, targetValue) => {
    try {
      await verificationService.verifyAction(
        actionId,
        userData.username,
        targetValue
      );
      // Reload user data
      await loadUserData(verificationService);
    } catch (error) {
      console.error("Verification failed:", error);
    }
  };

  return (
    <div className="verification-dashboard">
      <h1>Twitter Verification Dashboard</h1>

      {userData && (
        <div className="user-info">
          <h2>User: {userData.username}</h2>
          <p>Total Verified Actions: {userData.totalActionsVerified}</p>
          <p>
            Last Verification:{" "}
            {new Date(
              userData.lastVerificationTimestamp * 1000
            ).toLocaleString()}
          </p>
        </div>
      )}

      <div className="available-actions">
        <h3>Available Verifications</h3>
        {availableActions.map((actionId) => (
          <ActionCard
            key={actionId}
            actionId={actionId}
            onVerify={handleVerifyAction}
          />
        ))}
      </div>
    </div>
  );
};
```

## Deployment

### Prerequisites

1. Install dependencies:

```bash
npm install
forge install
```

2. Set up environment variables:

```bash
export PRIVATE_KEY="your_private_key"
export RPC_URL="your_rpc_url"
```

### Deploy Contracts

```bash
forge script script/DeployDynamicTwitter.s.sol --rpc-url $RPC_URL --broadcast
```

### Run Tests

```bash
forge test
```

## Configuration Management

### Adding New Action Types

```solidity
// Add a new action for checking if user mentioned a specific account
uint256 newActionId = prover.addActionConfig(
    DynamicTwitterProver.ActionType.REPLY_TO_POST,
    "https://api.x.com/1.1/statuses/mentions_timeline.json?screen_name={username}",
    "in_reply_to_screen_name",
    "{target_username}"
);
```

### Updating Existing Actions

```solidity
// Update an existing action configuration
prover.updateActionConfig(
    actionId,
    "https://new-api-endpoint.com",
    "new_json_path",
    "new_expected_value",
    true // isActive
);
```

## Security Considerations

1. **Access Control**: Implement proper access control for admin functions
2. **Input Validation**: Validate all user inputs and proof data
3. **Rate Limiting**: Consider implementing rate limiting for verification requests
4. **Proof Verification**: Ensure all proofs are properly validated through vlayer
5. **Data Privacy**: Be mindful of what user data is stored on-chain

## Gas Optimization

- Batch multiple verifications in single transaction
- Use events for historical data that doesn't need on-chain queries
- Implement pagination for large data sets
- Consider using IPFS for storing large metadata

## Future Enhancements

1. **Reputation Scoring**: Implement weighted scoring based on action types
2. **Time-based Verification**: Add expiration dates for verifications
3. **Social Graph Analysis**: Track relationships between verified users
4. **Integration APIs**: Build REST APIs for easier frontend integration
5. **Mobile SDK**: Create mobile SDKs for React Native/Flutter

## Support

For questions and support:

- Create an issue in this repository
- Join our Discord community
- Check the vlayer documentation

## License

MIT License - see LICENSE file for details
