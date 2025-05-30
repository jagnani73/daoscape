export interface Token {
  chain_id: number;
  token_address: string;
}

export interface DAO {
  dao_id: string;
  created_at: string;
  name: string;
  description: string;
  logo: string;
  socials: [string, string, string, string]; // [discord, tg, twitter, website]
  owner_address: string;
  tokens: Token[];
  tags: string[];
  total_members: number;
  total_proposals: number;
}

export interface DAOResponse {
  success: boolean;
  data: DAO[];
}

export interface JoinDAOResponse {
  success: boolean;
  message?: string;
}

export interface DAOMember {
  id: string;
  address: string;
  joinedAt: string;
  role: "member" | "admin" | "moderator";
  votingPower: number;
}

export interface MembershipRequest {
  id: string;
  daoId: string;
  userAddress: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  message?: string;
}

export type MembershipStatus = "not_member" | "pending" | "member" | "admin";
