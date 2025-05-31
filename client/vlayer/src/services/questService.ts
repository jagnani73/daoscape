import {
  Quest,
  CreateQuestRequest,
  QuestParticipant,
  JoinQuestRequest,
  UpdateCompletionRequest,
  QuestResponse,
  QuestsResponse,
  QuestParticipantResponse,
  QuestParticipantsResponse,
  GenericResponse,
  QuestWithStatus,
  QuestStatus,
} from "../types/quest";

const API_BASE_URL = import.meta.env.VITE_BE_API_URL;

export const questService = {
  // Quest Management
  createQuest: async (
    questData: CreateQuestRequest
  ): Promise<QuestResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/quest/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questData),
      });

      const data: QuestResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("Error creating quest:", error);
      throw error;
    }
  },

  getQuestsByDAO: async (daoId: string): Promise<Quest[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/quest/dao/${daoId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: QuestsResponse = await response.json();

      if (!data.success) {
        throw new Error("API returned unsuccessful response");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching quests for DAO:", error);
      throw error;
    }
  },

  getQuestById: async (questId: string): Promise<Quest | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/quest/${questId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: QuestResponse = await response.json();

      if (!data.success) {
        throw new Error("API returned unsuccessful response");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching quest by ID:", error);
      return null;
    }
  },

  // Quest Participation
  joinQuest: async (joinData: JoinQuestRequest): Promise<GenericResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/quest-participant/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(joinData),
        }
      );

      const data: GenericResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("Error joining quest:", error);
      throw error;
    }
  },

  getQuestParticipants: async (
    questId: string
  ): Promise<QuestParticipant[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/quest-participant/quest/${questId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: QuestParticipantsResponse = await response.json();

      if (!data.success) {
        throw new Error("API returned unsuccessful response");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching quest participants:", error);
      throw error;
    }
  },

  getParticipantStatus: async (
    questId: string,
    memberId: string
  ): Promise<QuestParticipant | null> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/quest-participant/quest/${questId}/member/${memberId}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null; // User hasn't joined this quest
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: QuestParticipantResponse = await response.json();

      if (!data.success) {
        throw new Error("API returned unsuccessful response");
      }

      return data.data;
    } catch (error) {
      console.error("Error fetching participant status:", error);
      return null;
    }
  },

  updateParticipantCompletion: async (
    questId: string,
    memberId: string,
    completionData: UpdateCompletionRequest
  ): Promise<GenericResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/quest-participant/quest/${questId}/member/${memberId}/completion`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(completionData),
        }
      );

      const data: GenericResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("Error updating participant completion:", error);
      throw error;
    }
  },

  // Utility functions
  getQuestStatus: (quest: Quest): QuestStatus => {
    const now = new Date();
    const startTime = new Date(quest.start_time);
    const endTime = new Date(quest.end_time);

    if (now < startTime) {
      return "upcoming";
    } else if (now > endTime) {
      return "expired";
    } else {
      return "active";
    }
  },

  getQuestsWithStatus: async (
    daoId: string,
    userAddress?: string
  ): Promise<QuestWithStatus[]> => {
    try {
      const quests = await questService.getQuestsByDAO(daoId);
      const questsWithStatus: QuestWithStatus[] = [];

      for (const quest of quests) {
        const status = questService.getQuestStatus(quest);
        const participants = await questService.getQuestParticipants(
          quest.quest_id
        );

        let userParticipation: QuestParticipant | undefined;
        if (userAddress) {
          userParticipation =
            (await questService.getParticipantStatus(
              quest.quest_id,
              userAddress
            )) || undefined;
        }

        questsWithStatus.push({
          ...quest,
          status,
          participantCount: participants.length,
          userParticipation,
        });
      }

      return questsWithStatus;
    } catch (error) {
      console.error("Error fetching quests with status:", error);
      throw error;
    }
  },

  isQuestCompleted: (participant: QuestParticipant, quest: Quest): boolean => {
    const followCompleted =
      !quest.twitter_follow_enabled || participant.twitter_follow_completed;
    const likeCompleted =
      !quest.twitter_like_enabled || participant.twitter_like_completed;
    const retweetCompleted =
      !quest.twitter_retweet_enabled || participant.twitter_retweet_completed;

    return followCompleted && likeCompleted && retweetCompleted;
  },
};
