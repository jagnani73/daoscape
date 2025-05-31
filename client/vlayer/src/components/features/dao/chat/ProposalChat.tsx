import React, { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { Separator } from "../../../ui/separator";
import { Message } from "../../../../types/dao";
import { messagesService } from "../../../../services/messagesService";
import { formatDateTime } from "../../../../utils/daoHelpers";

interface ProposalChatProps {
  proposalId: string;
  proposalTitle: string;
  isUserMember: boolean;
}

export const ProposalChat: React.FC<ProposalChatProps> = ({
  proposalId,
  proposalTitle,
  isUserMember,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isPolling, setIsPolling] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { address, isConnected } = useAccount();

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, [proposalId]);

  // Set up polling for new messages
  useEffect(() => {
    if (!isPolling) return;

    const startPolling = () => {
      pollingIntervalRef.current = setInterval(() => {
        // Only poll if we're not currently loading, sending, or typing
        if (!loading && !sending && !loadingMore && !isTyping) {
          pollForNewMessages();
        }
      }, 5000); // Poll every 5 seconds
    };

    startPolling();

    // Cleanup interval on unmount or when polling is disabled
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isPolling, loading, sending, loadingMore, messages.length, isTyping]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const pollForNewMessages = async () => {
    try {
      // Get the latest message timestamp to only fetch newer messages
      const latestMessageTime =
        messages.length > 0
          ? new Date(messages[messages.length - 1].created_at).getTime()
          : 0;

      const response = await messagesService.getMessageHistory({
        proposal_id: proposalId,
        limit: 50,
        offset: 0,
      });

      if (response.success && response.data) {
        // Filter for messages newer than our latest message
        const newMessages = response.data.filter(
          (message) =>
            new Date(message.created_at).getTime() > latestMessageTime
        );

        if (newMessages.length > 0) {
          // Sort new messages (they come in descending order, so reverse)
          const sortedNewMessages = [...newMessages].reverse();

          // Check for duplicates before adding (in case of race conditions)
          setMessages((prev) => {
            const existingIds = new Set(prev.map((msg) => msg.id));
            const uniqueNewMessages = sortedNewMessages.filter(
              (msg) => !existingIds.has(msg.id)
            );

            if (uniqueNewMessages.length > 0) {
              return [...prev, ...uniqueNewMessages];
            }
            return prev;
          });
        }
      }
    } catch (error) {
      console.error("Error polling for new messages:", error);
      // Don't show error to user for polling failures, just log them
    }
  };

  const loadMessages = async (offset = 0, append = false) => {
    try {
      if (!append) setLoading(true);
      setError(null);

      const response = await messagesService.getMessageHistory({
        proposal_id: proposalId,
        limit: 50,
        offset,
      });

      if (response.success && response.data) {
        // Messages come in descending order (newest first), so reverse for chat display
        const sortedMessages = [...response.data].reverse();

        if (append) {
          setMessages((prev) => [...sortedMessages, ...prev]);
        } else {
          setMessages(sortedMessages);
        }

        // Check if there are more messages to load
        setHasMore(response.data.length === 50);
      } else {
        setError(response.error || "Failed to load messages");
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    await loadMessages(messages.length, true);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !address || !isConnected || !isUserMember) {
      return;
    }

    if (newMessage.length > 1000) {
      setError("Message must be 1000 characters or less");
      return;
    }

    try {
      setSending(true);
      setError(null);

      const response = await messagesService.createMessage({
        member_id: address,
        proposal_id: proposalId,
        message: newMessage.trim(),
      });

      if (response.success && response.data) {
        // Add the new message to the end of the list
        setMessages((prev) => [...prev, response.data!]);
        setNewMessage("");
      } else {
        setError(response.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);

    // Set typing state
    setIsTyping(true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to clear typing state after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return formatDateTime(timestamp);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isOwnMessage = (message: Message) => {
    return address && message.member_id.toLowerCase() === address.toLowerCase();
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              💬 Discussion
            </CardTitle>
            <CardDescription className="text-sm">
              Chat about "{proposalTitle}"
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isPolling && !isTyping && (
              <Badge variant="outline" className="text-xs animate-pulse">
                🔄 Auto-refresh
              </Badge>
            )}
            {isPolling && isTyping && (
              <Badge variant="outline" className="text-xs">
                ⏸️ Paused (typing)
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => pollForNewMessages()}
              disabled={loading || sending}
              className="text-xs"
            >
              🔄 Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPolling(!isPolling)}
              className="text-xs"
            >
              {isPolling ? "⏸️ Pause" : "▶️ Resume"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div
          className="flex-1 px-4 overflow-y-auto max-h-[400px]"
          ref={scrollAreaRef}
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadMessages()}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Load More Button */}
              {hasMore && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadMoreMessages}
                    disabled={loadingMore}
                  >
                    {loadingMore ? "Loading..." : "Load older messages"}
                  </Button>
                </div>
              )}

              {/* Messages */}
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${
                    isOwnMessage(message) ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isOwnMessage(message)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">
                        {isOwnMessage(message)
                          ? "You"
                          : truncateAddress(message.member_id)}
                      </span>
                      <span className="text-xs opacity-70">
                        {formatMessageTime(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Message Input */}
        <div className="p-4">
          {!isConnected ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Connect your wallet to join the discussion
              </p>
            </div>
          ) : !isUserMember ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                You must be a DAO member to participate in discussions
              </p>
            </div>
          ) : (
            <div className="flex gap-2">
              <textarea
                value={newMessage}
                onChange={handleMessageChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={sending}
                maxLength={1000}
                className="flex-1 min-h-[40px] max-h-[120px] px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md resize-none"
                rows={1}
              />
              <Button
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                size="sm"
              >
                {sending ? "Sending..." : "Send"}
              </Button>
            </div>
          )}

          {newMessage.length > 900 && (
            <p className="text-xs text-muted-foreground mt-1">
              {1000 - newMessage.length} characters remaining
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
