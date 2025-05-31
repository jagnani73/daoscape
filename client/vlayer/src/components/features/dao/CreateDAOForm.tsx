import React, { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";

interface CreateDAOFormProps {
  onDAOCreated: () => void;
  onCancel: () => void;
}

interface CreateDAORequest {
  name: string;
  description: string;
  logo: string;
  owner_address: string;
  tokens: Array<{
    token_address: string;
    chain_id: number;
  }>;
  socials: {
    twitter?: string;
    telegram?: string;
    discord?: string;
    website?: string;
  };
  tags: string[];
  email_subfix: string;
}

interface TokenInput {
  token_address: string;
  chain_id: number;
}

export const CreateDAOForm: React.FC<CreateDAOFormProps> = ({
  onDAOCreated,
  onCancel,
}) => {
  const { address } = useAccount();
  const [formData, setFormData] = useState<CreateDAORequest>({
    name: "",
    description: "",
    logo: "",
    owner_address: address || "",
    tokens: [],
    socials: {
      twitter: "",
      telegram: "",
      discord: "",
      website: "",
    },
    tags: [],
    email_subfix: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [tokens, setTokens] = useState<TokenInput[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("socials.")) {
      const socialKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        socials: {
          ...prev.socials,
          [socialKey]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    setFormData((prev) => ({
      ...prev,
      tags,
    }));
  };

  const addToken = () => {
    setTokens([...tokens, { token_address: "", chain_id: 1 }]);
  };

  const removeToken = (index: number) => {
    setTokens(tokens.filter((_, i) => i !== index));
  };

  const updateToken = (
    index: number,
    field: keyof TokenInput,
    value: string | number
  ) => {
    const updatedTokens = tokens.map((token, i) =>
      i === index ? { ...token, [field]: value } : token
    );
    setTokens(updatedTokens);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_BE_API_URL;

      const processedSocials: any = {};
      if (formData.socials.twitter?.trim())
        processedSocials.twitter = formData.socials.twitter.trim();
      if (formData.socials.telegram?.trim())
        processedSocials.telegram = formData.socials.telegram.trim();
      if (formData.socials.discord?.trim())
        processedSocials.discord = formData.socials.discord.trim();
      if (formData.socials.website?.trim())
        processedSocials.website = formData.socials.website.trim();

      const validTokens = tokens.filter(
        (token) => token.token_address.trim() && token.chain_id > 0
      );

      const requestData = {
        name: formData.name,
        description: formData.description,
        logo: formData.logo,
        owner_address: address,
        tokens: validTokens,
        socials: processedSocials,
        tags: formData.tags,
        email_subfix: formData.email_subfix,
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/dao/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess("DAO created successfully!");
        setTimeout(() => {
          onDAOCreated();
        }, 2000);
      } else {
        setError(result.message || "Failed to create DAO");
      }
    } catch (error) {
      console.error("Error creating DAO:", error);
      setError("Failed to create DAO. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-red-600">🔒 Secret DAO Creation</CardTitle>
        <CardDescription>
          This is a hidden form for creating DAOs. Use with caution.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                DAO Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Test DAO"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-2"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="A test DAO for merit distribution"
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                required
              />
            </div>

            <div>
              <label htmlFor="logo" className="block text-sm font-medium mb-2">
                Logo URL *
              </label>
              <input
                id="logo"
                name="logo"
                type="url"
                value={formData.logo}
                onChange={handleInputChange}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email_subfix"
                className="block text-sm font-medium mb-2"
              >
                Email Suffix *
              </label>
              <input
                id="email_subfix"
                name="email_subfix"
                type="text"
                value={formData.email_subfix}
                onChange={handleInputChange}
                placeholder="@testdao.com"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-2">
                Tags (comma-separated)
              </label>
              <input
                id="tags"
                name="tags"
                type="text"
                value={formData.tags.join(", ")}
                onChange={handleTagsChange}
                placeholder="defi, governance, community"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Social Links</h3>

            <div>
              <label
                htmlFor="socials.twitter"
                className="block text-sm font-medium mb-2"
              >
                Twitter URL
              </label>
              <input
                id="socials.twitter"
                name="socials.twitter"
                type="url"
                value={formData.socials.twitter}
                onChange={handleInputChange}
                placeholder="https://twitter.com/testdao"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>

            <div>
              <label
                htmlFor="socials.telegram"
                className="block text-sm font-medium mb-2"
              >
                Telegram URL
              </label>
              <input
                id="socials.telegram"
                name="socials.telegram"
                type="url"
                value={formData.socials.telegram}
                onChange={handleInputChange}
                placeholder="https://t.me/testdao"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>

            <div>
              <label
                htmlFor="socials.discord"
                className="block text-sm font-medium mb-2"
              >
                Discord URL
              </label>
              <input
                id="socials.discord"
                name="socials.discord"
                type="url"
                value={formData.socials.discord}
                onChange={handleInputChange}
                placeholder="https://discord.gg/testdao"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>

            <div>
              <label
                htmlFor="socials.website"
                className="block text-sm font-medium mb-2"
              >
                Website URL
              </label>
              <input
                id="socials.website"
                name="socials.website"
                type="url"
                value={formData.socials.website}
                onChange={handleInputChange}
                placeholder="https://testdao.com"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
          </div>

          {/* Owner Address Display */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Owner Information</h3>
            <div>
              <label className="block text-sm font-medium mb-2">
                Owner Address (Auto-filled from wallet)
              </label>
              <input
                type="text"
                value={address || ""}
                disabled
                className="w-full px-3 py-2 border border-input rounded-md bg-muted text-sm text-muted-foreground"
              />
            </div>
          </div>

          {/* Tokens Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Tokens (Optional)</h3>
              <Button
                type="button"
                onClick={addToken}
                variant="outline"
                size="sm"
              >
                Add Token
              </Button>
            </div>

            {tokens.map((token, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    Token Address
                  </label>
                  <input
                    type="text"
                    value={token.token_address}
                    onChange={(e) =>
                      updateToken(index, "token_address", e.target.value)
                    }
                    placeholder="0xA0b86a33E6441b37e0ecD8f6c93e8ac4B5405c7B"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium mb-2">
                    Chain ID
                  </label>
                  <input
                    type="number"
                    value={token.chain_id}
                    onChange={(e) =>
                      updateToken(
                        index,
                        "chain_id",
                        parseInt(e.target.value) || 1
                      )
                    }
                    placeholder="1"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => removeToken(index)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            ))}

            {tokens.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No tokens added. Click "Add Token" to include token information.
              </p>
            )}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !address}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Creating..." : "Create Secret DAO"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
