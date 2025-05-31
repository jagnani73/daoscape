import { useState, useEffect } from "react";
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
  } = useMemberData();
  const [userDAOs, setUserDAOs] = useState<UserDAO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDAOs = async () => {
      if (!memberData?.memberships || memberData.memberships.length === 0) {
        setUserDAOs([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

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

        setUserDAOs(validDAOs);
      } catch (error) {
        console.error("Error fetching user DAOs:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch user DAOs"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserDAOs();
  }, [memberData]);

  return {
    userDAOs,
    loading: memberLoading || loading,
    error: memberError || error,
    memberData,
  };
};
