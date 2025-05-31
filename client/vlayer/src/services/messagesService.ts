import {
  Message,
  CreateMessageRequest,
  CreateMessageResponse,
  GetMessageHistoryRequest,
  GetMessageHistoryResponse,
} from "../types/dao";

const API_BASE_URL = import.meta.env.VITE_BE_API_URL || "http://localhost:3000";

export const messagesService = {
  createMessage: async (
    messageData: CreateMessageRequest
  ): Promise<CreateMessageResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/messages/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      const data: CreateMessageResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("Error creating message:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create message",
      };
    }
  },

  getMessageHistory: async (
    historyData: GetMessageHistoryRequest
  ): Promise<GetMessageHistoryResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/messages/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposal_id: historyData.proposal_id,
          limit: historyData.limit || 50,
          offset: historyData.offset || 0,
        }),
      });

      const data: GetMessageHistoryResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("Error fetching message history:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch message history",
      };
    }
  },
};
