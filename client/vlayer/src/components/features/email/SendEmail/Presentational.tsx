import React, { useState } from "react";

interface SendEmailProps {
  subject: string;
  uniqueEmail: string;
  onSendEmail: () => void;
  isLoading: boolean;
  emailSent: boolean;
  error?: string;
}

export const SendEmail: React.FC<SendEmailProps> = ({
  subject,
  uniqueEmail,
  onSendEmail,
  isLoading,
  emailSent,
  error,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openEmailClient = () => {
    const mailtoLink = `mailto:${uniqueEmail}?subject=${encodeURIComponent(
      subject
    )}`;
    window.open(mailtoLink, "_blank");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            📧 Email Verification
          </h1>
          <p className="text-lg text-gray-600">
            Send an email to verify your domain ownership and mint your NFT
          </p>
        </div>

        {!emailSent ? (
          <>
            {/* Email Instructions */}
            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                📝 Email Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    Send to:
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded text-sm">
                      {uniqueEmail}
                    </code>
                    <button
                      onClick={() => copyToClipboard(uniqueEmail)}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      {copied ? "✓" : "Copy"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-2">
                    Subject:
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded text-sm">
                      {subject}
                    </code>
                    <button
                      onClick={() => copyToClipboard(subject)}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      {copied ? "✓" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={openEmailClient}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                📧 Open Email Client
              </button>

              <div className="text-center">
                <span className="text-gray-500 text-sm">or</span>
              </div>

              <button
                onClick={onSendEmail}
                disabled={isLoading}
                className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  isLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Checking for Email...</span>
                  </div>
                ) : (
                  "✅ I've Sent the Email"
                )}
              </button>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">
                📋 Instructions:
              </h4>
              <ol className="text-gray-600 text-sm space-y-1">
                <li>1. Copy the email address and subject above</li>
                <li>2. Send an email from your domain email address</li>
                <li>3. Use the exact subject line provided</li>
                <li>4. Click "I've Sent the Email" to verify</li>
                <li>5. Wait for the verification to complete</li>
              </ol>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Email Sent Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Your email has been received and is being processed for
              verification.
            </p>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">
                ✅ You can now proceed to generate your email proof
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
