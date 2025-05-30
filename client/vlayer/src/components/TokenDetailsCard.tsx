import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Token, TokenDetails } from "../types/dao";
import { daoService } from "../services/daoService";

interface TokenDetailsCardProps {
  tokens: Token[];
  daoName: string;
}

export const TokenDetailsCard: React.FC<TokenDetailsCardProps> = ({
  tokens,
  daoName,
}) => {
  const [tokenDetails, setTokenDetails] = useState<TokenDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenDetails = async () => {
      if (tokens.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const details = await Promise.all(
          tokens.map(async (token) => {
            const response = await daoService.getTokenDetails(
              token.token_address,
              token.chain_id
            );
            return response.success ? response.data : null;
          })
        );

        const validDetails = details.filter(
          (detail): detail is TokenDetails => detail !== null
        );

        setTokenDetails(validDetails);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch token details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTokenDetails();
  }, [tokens]);

  const getChainName = (chainId: number): string => {
    switch (chainId) {
      case 1:
        return "Ethereum";
      case 137:
        return "Polygon";
      case 56:
        return "BSC";
      case 42161:
        return "Arbitrum";
      case 10:
        return "Optimism";
      case 8453:
        return "Base";
      case 100:
        return "Gnosis";
      case 1313161554:
        return "Sepolia";
      case 11155111:
        return "Sepolia";
      default:
        return `Chain ${chainId}`;
    }
  };

  const formatPrice = (priceUsd: string): string => {
    const price = parseFloat(priceUsd);
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    }
    return `$${price.toFixed(4)}`;
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4) return "bg-green-100 text-green-800 border-green-200";
    if (rating >= 3) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getRatingText = (rating: number): string => {
    if (rating >= 4) return "High";
    if (rating >= 3) return "Medium";
    return "Low";
  };

  if (tokens.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Requirements</CardTitle>
          <CardDescription>
            This DAO does not have specific token requirements for membership.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Requirements</CardTitle>
          <CardDescription>Loading token details...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Requirements</CardTitle>
          <CardDescription>
            Failed to load token details: {error}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Requirements</CardTitle>
        <CardDescription>
          You must own the following tokens to be eligible for membership in{" "}
          {daoName}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tokenDetails.map((token, index) => (
          <div
            key={`${token.address}-${token.chainId}`}
            className="border rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {token.logoURI ? (
                  <img
                    src={token.logoURI}
                    alt={token.name}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">
                      {token.symbol.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold">{token.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {token.symbol}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{getChainName(token.chainId)}</Badge>
                <Badge className={getRatingColor(token.rating)}>
                  {getRatingText(token.rating)} Trust
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Price (USD)</p>
                <p className="font-medium">{formatPrice(token.price_usd)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Decimals</p>
                <p className="font-medium">{token.decimals}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Rating</p>
                <p className="font-medium">{token.rating}/5</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fee on Transfer</p>
                <p className="font-medium">{token.isFoT ? "Yes" : "No"}</p>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground text-sm">Contract Address</p>
              <p className="font-mono text-xs bg-muted p-2 rounded break-all">
                {token.address}
              </p>
            </div>

            {token.tags.length > 0 && (
              <div>
                <p className="text-muted-foreground text-sm mb-2">Tags</p>
                <div className="flex gap-1 flex-wrap">
                  {token.tags.map((tag, tagIndex) => (
                    <Badge
                      key={tagIndex}
                      variant="secondary"
                      className="text-xs"
                    >
                      {tag.value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {token.providers.length > 0 && (
              <div>
                <p className="text-muted-foreground text-sm mb-2">
                  Verified by
                </p>
                <div className="flex gap-1 flex-wrap">
                  {token.providers.map((provider, providerIndex) => (
                    <Badge
                      key={providerIndex}
                      variant="outline"
                      className="text-xs"
                    >
                      {provider}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600">⚠️</span>
            <div>
              <h4 className="font-semibold text-yellow-800">
                Membership Requirement
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                To join this DAO, you must hold at least one of the tokens
                listed above in your connected wallet. Token ownership will be
                verified when you attempt to join.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
