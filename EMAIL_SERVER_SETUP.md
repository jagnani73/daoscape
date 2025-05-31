# Email Server Setup for vlayer Email Verification

This document outlines the email server infrastructure needed to support email verification using vlayer.

## Overview

The email verification system uses an S3 bucket to store incoming emails as `.eml` files. The system polls this bucket to check for new emails and fetch their content for verification.

## Current Configuration

- **Email Service URL**: `https://email-example-inbox.s3.us-east-2.amazonaws.com`
- **Email Domain**: `proving.vlayer.xyz`
- **File Format**: `.eml` files named with UUID (e.g., `{uuid}.eml`)

## Required Infrastructure

### 1. Email Server Setup

You need an email server that can:

- Receive emails sent to `*@proving.vlayer.xyz`
- Save incoming emails as `.eml` files
- Upload these files to an S3 bucket with the naming convention `{uuid}.eml`

### 2. S3 Bucket Configuration

The S3 bucket should be configured with:

- Public read access for `.eml` files
- CORS enabled for web access
- Proper naming convention: `{emailId}.eml`

### 3. Email Processing Flow

1. User generates a unique email ID (UUID)
2. User sends email to `{uuid}@proving.vlayer.xyz`
3. Email server receives the email
4. Email server saves the email as `{uuid}.eml`
5. Email server uploads the file to S3
6. Frontend polls S3 to check if the file exists
7. Frontend fetches the `.eml` content for verification

## Implementation Options

### Option 1: AWS SES + Lambda + S3

```typescript
// Lambda function to process incoming emails
import { S3 } from "aws-sdk";

export const handler = async (event: any) => {
  const s3 = new S3();

  // Extract email content from SES event
  const emailContent = event.Records[0].ses.mail.commonHeaders;
  const messageId = event.Records[0].ses.mail.messageId;

  // Extract UUID from recipient email
  const recipient = emailContent.to[0];
  const uuid = recipient.split("@")[0];

  // Save email as .eml file to S3
  await s3
    .putObject({
      Bucket: "email-example-inbox",
      Key: `${uuid}.eml`,
      Body: emailContent.rawMessage,
      ContentType: "message/rfc822",
      ACL: "public-read",
    })
    .promise();
};
```

### Option 2: Postfix + Custom Script

```bash
#!/bin/bash
# /etc/postfix/email-processor.sh

# Extract UUID from email address
UUID=$(echo "$1" | cut -d'@' -f1)

# Save email content to temporary file
cat > "/tmp/${UUID}.eml"

# Upload to S3
aws s3 cp "/tmp/${UUID}.eml" "s3://email-example-inbox/${UUID}.eml" --acl public-read

# Cleanup
rm "/tmp/${UUID}.eml"
```

### Option 3: Node.js Email Server

```typescript
import { createServer } from "smtp-server";
import { S3 } from "aws-sdk";
import { simpleParser } from "mailparser";

const s3 = new S3();

const server = createServer({
  onData(stream, session, callback) {
    simpleParser(stream, async (err, parsed) => {
      if (err) return callback(err);

      // Extract UUID from recipient
      const recipient = parsed.to?.value[0]?.address || "";
      const uuid = recipient.split("@")[0];

      // Convert back to .eml format
      const emlContent = stream.toString();

      // Upload to S3
      await s3
        .putObject({
          Bucket: "email-example-inbox",
          Key: `${uuid}.eml`,
          Body: emlContent,
          ContentType: "message/rfc822",
          ACL: "public-read",
        })
        .promise();

      callback();
    });
  },
});

server.listen(25);
```

## DNS Configuration

Set up MX records for `proving.vlayer.xyz`:

```
proving.vlayer.xyz.    IN    MX    10    mail.proving.vlayer.xyz.
```

## Security Considerations

1. **DKIM Signing**: Ensure your email server properly handles DKIM signatures
2. **SPF Records**: Configure SPF records for the domain
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **File Cleanup**: Implement automatic cleanup of old `.eml` files
5. **Access Control**: Ensure S3 bucket has proper access controls

## Testing

Test the email server with:

```bash
# Send test email
echo "Subject: Test Email
From: test@example.com
To: test-uuid@proving.vlayer.xyz

This is a test email." | sendmail test-uuid@proving.vlayer.xyz

# Check if file was created
curl -I https://email-example-inbox.s3.us-east-2.amazonaws.com/test-uuid.eml
```

## Environment Variables

Add these to your frontend environment:

```env
VITE_EMAIL_SERVICE_URL=https://email-example-inbox.s3.us-east-2.amazonaws.com
VITE_EMAIL_DOMAIN=proving.vlayer.xyz
```
