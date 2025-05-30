import axios, { AxiosInstance } from "axios";

interface BlockscoutNonceResponse {
  nonce: string;
  merits_login_nonce: string | null;
}

interface BlockscoutLoginResponse {
  created: boolean;
  token: string;
}

class BlockscoutClientService {
  private static axiosInstance: AxiosInstance;

  static {
    this.axiosInstance = axios.create({
      baseURL: "https://merits-staging.blockscout.com",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  public static getInstance(): AxiosInstance {
    return BlockscoutClientService.axiosInstance;
  }
}

export const getBlockscoutNonce = async (): Promise<string> => {
  try {
    const axiosInstance = BlockscoutClientService.getInstance();
    const response = await axiosInstance.get<BlockscoutNonceResponse>(
      "/api/v1/auth/nonce"
    );

    return response.data.nonce;
  } catch (error) {
    throw new Error(
      `Error fetching Blockscout nonce: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const createSIWEMessage = (
  address: string,
  nonce: string,
  chainId: number
): string => {
  const domain = "merits.blockscout.com";
  const uri = "https://merits.blockscout.com";
  const version = "1";
  const statement = "Sign-In for the Blockscout Merits program.";
  const issuedAt = new Date().toISOString();
  const expirationTime = new Date(
    Date.now() + 365 * 24 * 60 * 60 * 1000
  ).toISOString(); // 1 year

  return `${domain} wants you to sign in with your Ethereum account:
${address}

${statement}

URI: ${uri}
Version: ${version}
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}
Expiration Time: ${expirationTime}`;
};

export const authenticateWithBlockscout = async (
  nonce: string,
  message: string,
  signature: string
): Promise<string> => {
  try {
    const axiosInstance = BlockscoutClientService.getInstance();
    const response = await axiosInstance.post<BlockscoutLoginResponse>(
      "/api/v1/auth/login",
      {
        nonce,
        message,
        signature,
      }
    );

    return response.data.token;
  } catch (error) {
    throw new Error(
      `Error authenticating with Blockscout: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const getAuthenticatedUserData = async (token: string) => {
  try {
    const axiosInstance = BlockscoutClientService.getInstance();
    const response = await axiosInstance.get("/api/v1/user/balances", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching authenticated user data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Function to get user activity logs
export const getUserActivityLogs = async (token: string, pageSize = 50) => {
  try {
    const axiosInstance = BlockscoutClientService.getInstance();
    const response = await axiosInstance.get("/api/v1/user/logs", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page_size: pageSize,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      `Error fetching user activity logs: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
