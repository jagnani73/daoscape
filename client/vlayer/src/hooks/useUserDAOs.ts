import { useState, useEffect, useCallback } from "react";
import { useMemberData } from "./useMemberData";
import { daoService } from "../services/daoService";
import { DAO } from "../types/dao";

interface UserDAO extends DAO {
  reputation: number;
  house: string;
  joined_at: string;
}

export const useUserDAOs = () => {
  const {
    memberData,
    loading: memberLoading,
    error: memberError,
    refetch: refetchMemberData,
  } = useMemberData();
  const [userDAOs, setUserDAOs] = useState<UserDAO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDAOs = useCallback(async () => {
    if (!memberData?.memberships || memberData.memberships.length === 0) {
      setUserDAOs([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log(
        "🔄 Fetching user DAOs for memberships:",
        memberData.memberships.length
      );

      const daoPromises = memberData.memberships.map(async (membership) => {
        try {
          const dao = await daoService.getDAOById(membership.dao_id);
          if (dao) {
            return {
              ...dao,
              reputation: membership.reputation,
              house: membership.house,
              joined_at: membership.created_at,
            } as UserDAO;
          }
          return null;
        } catch (error) {
          console.error(`Error fetching DAO ${membership.dao_id}:`, error);
          return null;
        }
      });

      const daos = await Promise.all(daoPromises);
      const validDAOs = daos.filter((dao): dao is UserDAO => dao !== null);

      console.log("✅ Successfully fetched user DAOs:", validDAOs.length);
      setUserDAOs(validDAOs);
    } catch (error) {
      console.error("Error fetching user DAOs:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch user DAOs"
      );
    } finally {
      setLoading(false);
    }
  }, [memberData]);

  useEffect(() => {
    fetchUserDAOs();
  }, [fetchUserDAOs]);

  const refetch = useCallback(async () => {
    console.log("🔄 Refetching user DAOs...");
    // First refetch member data to get updated memberships
    await refetchMemberData();
    // Then refetch user DAOs (this will happen automatically via useEffect when memberData updates)
  }, [refetchMemberData]);

  return {
    userDAOs,
    loading: memberLoading || loading,
    error: memberError || error,
    memberData,
    refetch,
  };
};
