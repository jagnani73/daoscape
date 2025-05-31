import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

interface Membership {
  house: string;
  dao_id: string;
  member_id: string;
  created_at: string;
  reputation: number;
}

interface MemberData {
  member_id: string;
  created_at: string;
  memberships: Membership[];
}

interface MemberResponse {
  success: boolean;
  data: MemberData;
}

export const useMemberData = () => {
  const { address, isConnected } = useAccount();
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberData = async (walletAddress: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://eth-prague-puce.vercel.app/api/v1/member/${walletAddress}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MemberResponse = await response.json();

      if (!data.success) {
        throw new Error("API returned unsuccessful response");
      }

      setMemberData(data.data);
    } catch (error) {
      console.error("Error fetching member data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch member data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address && isConnected) {
      fetchMemberData(address);
    } else {
      setMemberData(null);
      setError(null);
    }
  }, [address, isConnected]);

  return {
    memberData,
    loading,
    error,
    refetch: () => address && fetchMemberData(address),
  };
};
