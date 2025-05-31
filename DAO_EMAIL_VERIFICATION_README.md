# DAO Email Verification Integration

This integration allows users to verify their email domain ownership and earn reputation points in DAOs using vlayer's cryptographic email verification system.

## 🎯 Overview

The DAO Email Verification system enables:

- **Email Domain Verification**: Prove ownership of email domains using DKIM signatures
- **Reputation Points**: Earn reputation points in DAOs for completing verification
- **Governance Influence**: Higher reputation increases voting power and influence
- **Cryptographic Proof**: Uses zero-knowledge proofs for privacy-preserving verification

## 🏗️ Architecture

```
Email Verification → vlayer Proof → DAO Backend → Reputation Points
```

1. **User completes email verification** using the vlayer system
2. **Frontend submits verification** to DAO backend API
3. **Backend validates and awards** reputation points
4. **User gains increased influence** in DAO governance

## 📁 Components

### Frontend Components

#### `EmailVerificationForDAOContainer`

Main container component that manages the email verification flow for DAOs.

```typescript
<EmailVerificationForDAOContainer
  daoId="7ac7d61b-83fe-4376-8f23-b7325f41a5b5"
  onSuccess={() => console.log("Verification completed!")}
  onError={(error) => console.error("Verification failed:", error)}
/>
```

#### `DAOReputationTab`

Tab component for DAO detail pages that shows reputation activities.

```typescript
<DAOReputationTab
  dao={dao}
  membershipStatus={membershipStatus}
  isConnected={isConnected}
  onReputationEarned={() => refreshDAOData()}
/>
```

#### `EmailVerificationDemoPage`

Complete demo page showcasing the email verification integration.

### Backend Integration

The system integrates with the existing DAO backend API:

```bash
curl --location 'http://localhost:7000/api/v1/membership/email-verified' \
--header 'Content-Type: application/json' \
--data '{
    "wallet_address": "0x1234567890123456789012345678901234567890",
    "dao_id": "7ac7d61b-83fe-4376-8f23-b7325f41a5b5"
}'
```

## 🚀 Usage

### 1. Basic Integration

Add the reputation tab to your DAO detail page:

```typescript
import { DAOReputationTab } from "./components/features/dao";

// In your DAO detail page
<Tabs>
  <TabsTrigger value="reputation">Reputation</TabsTrigger>

  <TabsContent value="reputation">
    <DAOReputationTab
      dao={dao}
      membershipStatus={membershipStatus}
      isConnected={isConnected}
      onReputationEarned={handleReputationEarned}
    />
  </TabsContent>
</Tabs>;
```

### 2. Standalone Email Verification

Use the email verification component independently:

```typescript
import { EmailVerificationForDAOContainer } from "./components/features/dao";

<EmailVerificationForDAOContainer
  daoId={selectedDAO.dao_id}
  onSuccess={() => {
    console.log("Email verified successfully!");
    // Refresh user data, show success message, etc.
  }}
  onError={(error) => {
    console.error("Verification failed:", error);
    // Show error message to user
  }}
/>;
```

### 3. Demo Page

Use the complete demo page:

```typescript
import { EmailVerificationDemoPage } from "./pages/EmailVerificationDemoPage";

// In your router
<Route path="/email-verification-demo" component={EmailVerificationDemoPage} />;
```

## 🔧 Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Backend API URL
VITE_BE_API_URL=http://localhost:7000

# Email verification settings (from vlayer setup)
VITE_EMAIL_SERVICE_URL=https://email-example-inbox.s3.us-east-2.amazonaws.com
VITE_EMAIL_PROVER_ADDRESS=<your_prover_address>
VITE_EMAIL_VERIFIER_ADDRESS=<your_verifier_address>
VITE_PROVER_URL=<vlayer_prover_url>
```

### Dependencies

Ensure these packages are installed:

```bash
npm install uuid @types/uuid @vlayer/sdk wagmi
```

## 📋 User Flow

### Step 1: Access Reputation Activities

1. User navigates to a DAO detail page
2. User clicks on the "Reputation" tab
3. System shows available reputation activities

### Step 2: Start Email Verification

1. User clicks "Start Email Verification"
2. System generates unique email address
3. User sends email from their domain

### Step 3: Complete Verification

1. System polls for email receipt
2. User generates cryptographic proof
3. System verifies proof on-chain

### Step 4: Submit to DAO

1. User submits verification to specific DAO
2. Backend validates and awards reputation points
3. User's DAO influence increases

## 🎨 UI Features

### Visual Indicators

- **Step Progress**: Clear visual progress through verification steps
- **Status Badges**: Show verification and membership status
- **Success States**: Celebration UI for completed verifications
- **Error Handling**: Clear error messages and retry options

### Responsive Design

- **Mobile Friendly**: Works on all device sizes
- **Modern UI**: Beautiful gradients and animations
- **Accessibility**: Proper ARIA labels and keyboard navigation

## 🔒 Security Features

### Privacy Protection

- **Zero-Knowledge Proofs**: Email content remains private
- **DKIM Validation**: Cryptographic verification of email authenticity
- **Domain Verification**: Proves ownership without exposing email content

### Anti-Fraud Measures

- **One-Time Use**: Each email verification can only be used once
- **Wallet Binding**: Verification tied to specific wallet address
- **Timestamp Validation**: Prevents replay attacks

## 🧪 Testing

### Manual Testing

1. Connect wallet to the application
2. Navigate to DAO detail page → Reputation tab
3. Start email verification process
4. Send email from your domain
5. Complete verification and submit to DAO
6. Verify reputation points were awarded

### API Testing

```bash
# Test the backend endpoint
curl --location 'http://localhost:7000/api/v1/membership/email-verified' \
--header 'Content-Type: application/json' \
--data '{
    "wallet_address": "0x1234567890123456789012345678901234567890",
    "dao_id": "7ac7d61b-83fe-4376-8f23-b7325f41a5b5"
}'
```

## 🚨 Error Handling

The system handles various error scenarios:

- **Wallet Not Connected**: Shows connection prompt
- **Not DAO Member**: Prompts user to join DAO first
- **Email Not Verified**: Guides user through verification process
- **Network Errors**: Shows retry options with exponential backoff
- **API Errors**: Displays user-friendly error messages

## 🔄 State Management

### Local Storage

- **Email Verification Data**: Temporarily stores verification data
- **Auto-cleanup**: Removes data after successful submission

### Component State

- **Loading States**: Shows progress indicators
- **Error States**: Manages error display and recovery
- **Success States**: Handles completion flows

## 📈 Future Enhancements

### Additional Verification Types

- **Social Media Verification**: Twitter, LinkedIn, GitHub
- **Professional Verification**: Company email domains
- **Skill Verification**: Technical certifications
- **Achievement Verification**: Open source contributions

### Enhanced Features

- **Batch Verification**: Verify multiple emails at once
- **Verification History**: Track past verifications
- **Reputation Leaderboards**: Show top contributors
- **Verification Rewards**: NFT badges for achievements

## 🤝 Contributing

To contribute to the DAO email verification system:

1. Follow the existing code patterns
2. Add proper TypeScript types
3. Include error handling
4. Write comprehensive tests
5. Update documentation

## 📞 Support

For issues or questions:

- Check the error messages in the UI
- Review browser console for technical details
- Ensure all environment variables are set correctly
- Verify wallet connection and DAO membership status
