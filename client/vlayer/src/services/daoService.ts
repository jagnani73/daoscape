import {
  DAO,
  DAOResponse,
  JoinDAOResponse,
  DAOMember,
  MembershipRequest,
  MembershipStatus,
} from "../types/dao";

const API_BASE_URL = import.meta.env.VITE_BE_API_URL;

const membershipStatus: Record<string, MembershipStatus> = {};

export const daoService = {
  getAllDAOs: async (): Promise<DAO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/dao`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DAOResponse = await response.json();

      if (!data.success) {
        throw new Error("API returned unsuccessful response");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching DAOs:", error);
      throw error;
    }
  },

  getAllDAOsRaw: async (): Promise<DAO[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/dao`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DAOResponse = await response.json();

      if (!data.success) {
        throw new Error("API returned unsuccessful response");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching DAOs:", error);
      throw error;
    }
  },

  getDAOById: async (id: string): Promise<DAO | null> => {
    try {
      const daos = await daoService.getAllDAOs();
      return daos.find((dao) => dao.dao_id === id) || null;
    } catch (error) {
      console.error("Error fetching DAO by ID:", error);
      return null;
    }
  },

  getDAOByIdRaw: async (id: string): Promise<DAO | null> => {
    try {
      const daos = await daoService.getAllDAOsRaw();
      return daos.find((dao) => dao.dao_id === id) || null;
    } catch (error) {
      console.error("Error fetching DAO by ID:", error);
      return null;
    }
  },

  getDAOsByCategory: async (category: string): Promise<DAO[]> => {
    try {
      const daos = await daoService.getAllDAOs();
      return daos.filter((dao) =>
        dao.tags.some((tag) => tag.toLowerCase() === category.toLowerCase())
      );
    } catch (error) {
      console.error("Error fetching DAOs by category:", error);
      return [];
    }
  },

  getDAOsByTag: async (tag: string): Promise<DAO[]> => {
    try {
      const daos = await daoService.getAllDAOsRaw();
      return daos.filter((dao) =>
        dao.tags.some((daoTag) => daoTag.toLowerCase() === tag.toLowerCase())
      );
    } catch (error) {
      console.error("Error fetching DAOs by tag:", error);
      return [];
    }
  },

  joinDAO: async (
    daoId: string,
    walletAddress: string
  ): Promise<JoinDAOResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/membership/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dao_id: daoId,
          wallet_address: walletAddress,
        }),
      });

      const data: JoinDAOResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("Error joining DAO:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to join DAO",
      };
    }
  },

  getMembershipStatus: async (
    daoId: string,
    userAddress: string
  ): Promise<MembershipStatus> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const key = `${daoId}-${userAddress}`;
    return membershipStatus[key] || "not_member";
  },

  requestToJoinDAO: async (
    daoId: string,
    userAddress: string,
    message?: string
  ): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const key = `${daoId}-${userAddress}`;

    const currentStatus = membershipStatus[key];
    if (currentStatus === "member" || currentStatus === "pending") {
      return false;
    }

    membershipStatus[key] = "pending";

    setTimeout(() => {
      membershipStatus[key] = "member";
    }, 3000);

    return true;
  },

  getCategories: async (): Promise<string[]> => {
    try {
      const daos = await daoService.getAllDAOsRaw();
      const allTags = daos.flatMap((dao) => dao.tags);
      const uniqueTags = [...new Set(allTags)];
      return uniqueTags.sort();
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  getTags: async (): Promise<string[]> => {
    return daoService.getCategories();
  },
};
