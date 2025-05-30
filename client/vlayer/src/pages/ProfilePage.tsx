import React, { useState, useEffect } from "react";
import { useAccount, useSignMessage, useChainId } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  NotificationProvider,
  TransactionPopupProvider,
  useTransactionPopup,
} from "@blockscout/app-sdk";
import axios from "axios";
import {
  getBlockscoutNonce,
  createSIWEMessage,
  authenticateWithBlockscout,
  getAuthenticatedUserData,
  getUserActivityLogs,
} from "../services/blockscout";

interface MeritsData {
  total_balance: string;
  referrals: string;
  registered_at: string;
  rank: string;
  users_below: string;
  top_percent: number;
}

interface UserBalanceData {
  total: string;
  staked: string;
  unstaked: string;
  total_staking_rewards: string;
  total_referral_rewards: string;
  pending_referral_rewards: string;
}

interface ActivityLog {
  action: string;
  details: any;
  timestamp: string;
}

const ProfileContent: React.FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { openPopup } = useTransactionPopup();

  const [meritsData, setMeritsData] = useState<MeritsData | null>(null);
  const [userBalance, setUserBalance] = useState<UserBalanceData | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const getAvatarUrl = (address: string) => {
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${address}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  };

  const fetchMeritsData = async (userAddress: string) => {
    try {
      setLoading(true);
      setError(null);

      const meritsResponse = await axios.get(
        `https://merits-staging.blockscout.com/api/v1/auth/user/${userAddress}`
      );

      if (meritsResponse.data) {
        setMeritsData(meritsResponse.data);
      }

      const leaderboardResponse = await axios.get(
        `https://merits-staging.blockscout.com/api/v1/leaderboard/users/${userAddress}`
      );

      if (leaderboardResponse.data) {
        setMeritsData((prev) => ({ ...prev, ...leaderboardResponse.data }));
      }
    } catch (err: any) {
      console.error("Error fetching merits data:", err);
      setError(
        "Failed to fetch merits data. User might not be registered in the merits program."
      );
    } finally {
      setLoading(false);
    }
  };

  const authenticateUser = async () => {
    if (!address || !chainId) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setIsAuthenticating(true);
      setError(null);

      // Step 1: Get nonce from Blockscout
      const nonce = await getBlockscoutNonce();

      // Step 2: Create SIWE message
      const message = createSIWEMessage(address, nonce, chainId);

      // Step 3: Sign the message
      const signature = await signMessageAsync({ message });

      // Step 4: Authenticate with Blockscout
      const token = await authenticateWithBlockscout(nonce, message, signature);

      // Step 5: Store token and set authenticated state
      setAuthToken(token);
      setIsAuthenticated(true);

      // Step 6: Fetch authenticated user data
      await fetchAuthenticatedData(token);
    } catch (err: any) {
      console.error("Authentication error:", err);
      setError(`Authentication failed: ${err.message}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const fetchAuthenticatedData = async (token: string) => {
    try {
      // Fetch detailed balance information
      const balanceData = await getAuthenticatedUserData(token);
      setUserBalance(balanceData);

      // Fetch activity logs
      const logsData = await getUserActivityLogs(token);
      setActivityLogs(logsData.items || []);
    } catch (err: any) {
      console.error("Error fetching authenticated data:", err);
      setError(`Failed to fetch authenticated data: ${err.message}`);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setIsAuthenticated(false);
    setUserBalance(null);
    setActivityLogs([]);
  };

  const showTransactionHistory = () => {
    if (address) {
      openPopup({
        chainId: "84532", // Base Sepolia chain ID
        address: address,
      });
    }
  };

  // Show all chain transactions
  const showAllTransactions = () => {
    openPopup({
      chainId: "84532", // Base Sepolia chain ID
    });
  };

  useEffect(() => {
    if (address && isConnected) {
      fetchMeritsData(address);
    }
  }, [address, isConnected]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to view your profile and merits
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={getAvatarUrl(address || "")}
                alt="User Avatar"
                className="w-16 h-16 rounded-full border-2 border-border"
              />
              <div>
                <CardTitle className="text-xl">User Profile</CardTitle>
                <CardDescription className="font-mono text-sm break-all">
                  {address}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  <Badge variant="default">Authenticated</Badge>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  onClick={authenticateUser}
                  disabled={isAuthenticating}
                  size="sm"
                >
                  {isAuthenticating
                    ? "Authenticating..."
                    : "Sign In with Wallet"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Authentication Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Merits Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🏆</span>
              <span>Blockscout Merits</span>
            </CardTitle>
            <CardDescription>
              Your activity rewards and ranking in the Blockscout ecosystem
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Loading merits data...
                </p>
              </div>
            ) : meritsData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Balance
                    </p>
                    <p className="text-2xl font-bold">
                      {meritsData.total_balance}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rank</p>
                    <p className="text-2xl font-bold">#{meritsData.rank}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Referrals</p>
                    <p className="text-lg font-semibold">
                      {meritsData.referrals}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Top Percent</p>
                    <Badge variant="secondary">
                      {meritsData.top_percent?.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Users Below</p>
                  <p className="text-lg font-semibold">
                    {meritsData.users_below}
                  </p>
                </div>
                {meritsData.registered_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Registered</p>
                    <p className="text-sm">
                      {new Date(meritsData.registered_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  No merits data available. You may need to register for the
                  Blockscout Merits program.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📊</span>
              <span>Transaction History</span>
            </CardTitle>
            <CardDescription>
              View your transaction history using Blockscout explorer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                onClick={showTransactionHistory}
                className="w-full"
                variant="default"
              >
                View My Transactions
              </Button>
              <Button
                onClick={showAllTransactions}
                className="w-full"
                variant="outline"
              >
                View All Chain Transactions
              </Button>
              <div className="text-xs text-muted-foreground text-center">
                Powered by Blockscout SDK
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Authenticated User Data */}
      {isAuthenticated && userBalance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>💰</span>
              <span>Detailed Balance Information</span>
            </CardTitle>
            <CardDescription>
              Authenticated view of your Blockscout Merits balance breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-xl font-bold">{userBalance.total}</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Staked</p>
                <p className="text-xl font-bold">{userBalance.staked}</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Unstaked</p>
                <p className="text-xl font-bold">{userBalance.unstaked}</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Staking Rewards</p>
                <p className="text-lg font-semibold">
                  {userBalance.total_staking_rewards}
                </p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Referral Rewards
                </p>
                <p className="text-lg font-semibold">
                  {userBalance.total_referral_rewards}
                </p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Pending Rewards</p>
                <p className="text-lg font-semibold">
                  {userBalance.pending_referral_rewards}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Logs */}
      {isAuthenticated && activityLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📋</span>
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Your recent Blockscout Merits activity and rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activityLogs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium capitalize">
                      {log.action.replace("_", " ")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(log.timestamp).toLocaleDateString()} at{" "}
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {log.details?.amount && (
                      <p className="font-semibold text-green-600">
                        +{log.details.amount}
                      </p>
                    )}
                    {log.details?.streak && (
                      <p className="text-sm text-muted-foreground">
                        Streak: {log.details.streak}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
          <CardDescription>
            Overview of your blockchain activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Network</p>
              <p className="font-semibold">Base Sepolia</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Address Type</p>
              <p className="font-semibold">EOA</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="default">
                {isAuthenticated ? "Authenticated" : "Active"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ProfilePage: React.FC = () => {
  return (
    <NotificationProvider>
      <TransactionPopupProvider>
        <div className="container mx-auto px-4 py-8">
          <ProfileContent />
        </div>
      </TransactionPopupProvider>
    </NotificationProvider>
  );
};
