export interface Token {
  chain_id: number;
  token_address: string;
}

export interface TokenTag {
  value: string;
  provider: string;
}

export interface TokenDetails {
  symbol: string;
  name: string;
  address: string;
  chainId: number;
  decimals: number;
  logoURI?: string;
  isFoT: boolean;
  rating: number;
  tags: TokenTag[];
  providers: string[];
  price_usd: string;
}

export interface TokenDetailsResponse {
  success: boolean;
  data?: TokenDetails;
  message?: string;
}

export interface Member {
  house: string;
  dao_id: string;
  member_id: string;
  created_at: string;
  reputation: number;
}

export interface Proposal {
  title: string;
  dao_id: string;
  conclusion: string;
  created_at: string;
  voting_end: string;
  description: string;
  proposal_id: string;
  feedback_end: string;
  voting_house: string;
  voting_start: string;
  feedback_conclusion: string;
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
  total_members?: number;
  total_proposals?: number;
  memberships?: Member[];
  proposals?: Proposal[];
  members?: Member[];
}

export interface DAODetailResponse {
  success: boolean;
  data: DAO;
}

export interface DAOResponse {
  success: boolean;
  data: DAO[];
}

export interface JoinDAOResponse {
  success: boolean;
  message?: string;
}

export interface CreateMemberResponse {
  success: boolean;
  message?: string;
  data?: {
    member_id?: string;
    wallet_address?: string;
    created_at?: string;
  };
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

export interface CreateProposalRequest {
  title: string;
  description: string;
  dao_id: string;
  voting_start: string;
  voting_end: string;
  feedback_end: string;
}

export interface CreateProposalResponse {
  success: boolean;
  message?: string;
  data?: {
    proposal_id?: string;
    title?: string;
    created_at?: string;
  };
}

export type MembershipStatus = "not_member" | "pending" | "member" | "admin";

export interface Vote {
  vote: "YES" | "NO" | "ABSTAIN";
  weight: number;
  member_id: string;
  created_at: string;
  is_feedback: boolean;
  proposal_id: string;
}

export interface ProposalWithVotes extends Proposal {
  votes: Vote[];
}

export interface ProposalDetailResponse {
  success: boolean;
  data: ProposalWithVotes;
  message?: string;
}

export interface VoteRequest {
  proposal_id: string;
  wallet_address: string;
  vote: "YES" | "NO" | "ABSTAIN";
  is_feedback: boolean;
}

export interface VoteResponse {
  success: boolean;
  message?: string;
}

export enum VoteType {
  YES = "YES",
  NO = "NO",
  ABSTAIN = "ABSTAIN",
}
