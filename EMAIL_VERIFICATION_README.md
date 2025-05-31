# Email Verification System with vlayer

This is a complete email verification system built with vlayer that allows users to prove domain ownership through email verification on-chain.

## Features

- 🔐 **Cryptographic Email Verification**: Uses DKIM signatures to verify email authenticity
- ⛓️ **On-chain Verification**: Stores verification results on the blockchain
- 🎯 **Domain Ownership Proof**: Proves ownership of email domains
- 🔒 **Privacy Preserving**: Uses zero-knowledge proofs to protect sensitive data
- 📧 **Real Email Integration**: Works with actual email servers and S3 storage

## Architecture

```
User Email → Email Server → S3 Storage → Frontend Polling → vlayer Proof → Blockchain
```

1. **User sends email** to a unique address (`{uuid}@proving.vlayer.xyz`)
2. **Email server** receives and stores the email as `.eml` file in S3
3. **Frontend polls** S3 to check for the email
4. **vlayer SDK** generates cryptographic proof from the email
5. **Smart contract** verifies the proof on-chain

## Components

### Frontend Components

- **`SendEmailContainer`**: Manages email sending flow and polling
- **`VerifyEmailContainer`**: Handles proof generation and on-chain verification
- **`EmailWorkflowContainer`**: Orchestrates the complete workflow
- **`EmailVerificationPage`**: Example page implementation

### Smart Contracts

- **`EmailDomainProver`**: Generates proofs from verified emails
- **`EmailDomainVerifier`**: Verifies proofs on-chain and stores results

## Usage

### 1. Import Components

```typescript
import { EmailWorkflowContainer } from "./components/features/email";
```

### 2. Use in Your App

```typescript
export const MyApp = () => {
  return (
    <div>
      <EmailWorkflowContainer />
    </div>
  );
};
```

### 3. Environment Setup

Add to your `.env` file:

```env
VITE_EMAIL_SERVICE_URL=https://email-example-inbox.s3.us-east-2.amazonaws.com
VITE_EMAIL_PROVER_ADDRESS=<your_prover_address>
VITE_EMAIL_VERIFIER_ADDRESS=<your_verifier_address>
VITE_PROVER_URL=<vlayer_prover_url>
```

## Email Flow

### Step 1: Send Email

1. User connects their wallet
2. System generates a unique email ID (UUID)
3. User sends email to `{uuid}@proving.vlayer.xyz`
4. Subject must be: `Verify my email at address: {wallet_address}`
5. System polls S3 for the email file

### Step 2: Verify Email

1. System fetches the `.eml` file from S3
2. Extracts DKIM signature and domain information
3. Fetches DNS records for DKIM verification
4. Generates cryptographic proof using vlayer
5. Submits proof to smart contract for on-chain verification

## Smart Contract Integration

### Prover Contract

```solidity
contract EmailDomainProver is Prover {
    function main(UnverifiedEmail calldata unverifiedEmail)
        public view returns (Proof memory, bytes32, address, string memory) {
        VerifiedEmail memory email = unverifiedEmail.verify();

        // Extract wallet address from subject
        string[] memory subjectCapture = email.subject.capture(
            "^Verify my email at address: (0x[a-fA-F0-9]{40})$"
        );

        // Extract domain from email
        string[] memory captures = email.from.capture(
            "^[\\w.-]+@([a-zA-Z\\d.-]+\\.[a-zA-Z]{2,})$"
        );

        return (proof(), sha256(abi.encodePacked(email.from)), targetWallet, domain);
    }
}
```

### Verifier Contract

```solidity
contract EmailDomainVerifier is Verifier {
    mapping(bytes32 => bool) public takenEmailHashes;

    event EmailVerified(bytes32 indexed emailHash, address indexed targetWallet, string emailDomain);

    function verify(Proof calldata, bytes32 _emailHash, address _targetWallet, string memory _emailDomain)
        public onlyVerified(prover, EmailDomainProver.main.selector) {
        require(takenEmailHashes[_emailHash] == false, "email taken");
        takenEmailHashes[_emailHash] = true;
        emit EmailVerified(_emailHash, _targetWallet, _emailDomain);
    }
}
```

## API Reference

### SendEmailContainer Props

```typescript
interface SendEmailContainerProps {
  // No props required - uses wallet connection internally
}
```

### VerifyEmailContainer Props

```typescript
interface VerifyEmailContainerProps {
  // No props required - reads from localStorage
}
```

### EmailWorkflowContainer Props

```typescript
interface EmailWorkflowContainerProps {
  // No props required - manages internal state
}
```

## Error Handling

The system handles various error scenarios:

- **Wallet not connected**: Shows connection prompt
- **Email not found**: Displays polling status and retry options
- **Invalid email format**: Validates DKIM signatures and domain extraction
- **Proof generation failure**: Shows detailed error messages
- **Transaction failure**: Handles blockchain transaction errors

## Security Considerations

1. **DKIM Validation**: Only emails with valid DKIM signatures are accepted
2. **Domain Matching**: DKIM signature domain must match sender domain
3. **Unique Emails**: Each email can only be used once (prevents replay attacks)
4. **Address Validation**: Wallet address in subject must match connected wallet

## Testing

### Manual Testing

1. Connect your wallet to the application
2. Note the generated email address
3. Send an email from your domain email to the generated address
4. Use the exact subject format shown in the UI
5. Wait for the email to be processed
6. Generate and verify the proof

### Automated Testing

```typescript
// Example test
describe("Email Verification", () => {
  it("should verify email domain ownership", async () => {
    const emailContent = `From: user@example.com
To: test-uuid@proving.vlayer.xyz
Subject: Verify my email at address: 0x1234567890123456789012345678901234567890

Test email content`;

    const unverifiedEmail = await preverifyEmail(emailContent, dnsRecords);
    const proof = await prover.prove(unverifiedEmail);

    expect(proof).toBeDefined();
    expect(proof.emailDomain).toBe("example.com");
  });
});
```

## Troubleshooting

### Common Issues

1. **Email not received**: Check email server configuration and S3 upload
2. **DKIM verification failed**: Ensure proper DKIM setup on sender domain
3. **Proof generation failed**: Check DNS records and email format
4. **Transaction failed**: Verify contract addresses and wallet connection

### Debug Mode

Enable debug logging:

```typescript
localStorage.setItem("vlayer-debug", "true");
```

## Dependencies

### Frontend

- `@vlayer/sdk`: vlayer SDK for proof generation
- `uuid`: For generating unique email IDs
- `wagmi`: For wallet integration

### Backend Infrastructure

- Email server (AWS SES, Postfix, etc.)
- S3 bucket for email storage
- DNS configuration for email domain

## License

This project is licensed under the MIT License.
