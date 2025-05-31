export interface Quest {
  quest_id: string;
  dao_id: string;
  start_time: string;
  end_time: string;
  title: string;
  description: string;
  reward_merits: number;
  reward_token_chain?: number;
  reward_token_address?: string;
  reward_token_amount?: number;
  twitter_account_url?: string;
  twitter_post_url?: string;
  twitter_follow_enabled: boolean;
  twitter_like_enabled: boolean;
  twitter_retweet_enabled: boolean;
  created_at?: string;
}

export interface CreateQuestRequest {
  dao_id: string;
  start_time: string;
  end_time: string;
  title: string;
  description: string;
  reward_merits: number;
  reward_token_chain?: number;
  reward_token_address?: string;
  reward_token_amount?: number;
  twitter_account_url?: string;
  twitter_post_url?: string;
  twitter_follow_enabled: boolean;
  twitter_like_enabled: boolean;
  twitter_retweet_enabled: boolean;
}

export interface QuestParticipant {
  quest_id: string;
  member_id: string;
  joined_at: string;
  twitter_follow_completed: boolean;
  twitter_like_completed: boolean;
  twitter_retweet_completed: boolean;
  twitter_follow_proof?: string;
  twitter_like_proof?: string;
  twitter_retweet_proof?: string;
  completed_at?: string;
  reward_claimed: boolean;
}

export interface JoinQuestRequest {
  member_id: string;
  quest_id: string;
}

export interface UpdateCompletionRequest {
  twitter_follow_completed?: boolean;
  twitter_like_completed?: boolean;
  twitter_retweet_completed?: boolean;
  twitter_follow_proof?: string;
  twitter_like_proof?: string;
  twitter_retweet_proof?: string;
}

export interface QuestResponse {
  success: boolean;
  data: Quest;
  message?: string;
}

export interface QuestsResponse {
  success: boolean;
  data: Quest[];
  message?: string;
}

export interface QuestParticipantResponse {
  success: boolean;
  data: QuestParticipant;
  message?: string;
}

export interface QuestParticipantsResponse {
  success: boolean;
  data: QuestParticipant[];
  message?: string;
}

export interface GenericResponse {
  success: boolean;
  message?: string;
}

export type QuestStatus = "upcoming" | "active" | "completed" | "expired";

export interface QuestWithStatus extends Quest {
  status: QuestStatus;
  participantCount?: number;
  userParticipation?: QuestParticipant;
}
