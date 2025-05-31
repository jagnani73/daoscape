import React, { useState } from "react";
import { useAccount } from "wagmi";
import { questService } from "../../../services/questService";
import { CreateQuestRequest } from "../../../types/quest";
import { useUserDAOs } from "../../../hooks/useUserDAOs";
import { isDAOOwner } from "../../../utils/daoHelpers";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Badge } from "../../ui/badge";

interface CreateQuestFormProps {
  daoId?: string;
  onQuestCreated: () => void;
  onCancel: () => void;
}

export const CreateQuestForm: React.FC<CreateQuestFormProps> = ({
  daoId: initialDaoId,
  onQuestCreated,
  onCancel,
}) => {
  const { address } = useAccount();
  const { userDAOs, loading: userDAOsLoading } = useUserDAOs();
  const [selectedDaoId, setSelectedDaoId] = useState<string>(
    initialDaoId || ""
  );
  const [formData, setFormData] = useState<CreateQuestRequest>({
    dao_id: initialDaoId || "",
    start_time: "",
    end_time: "",
    title: "",
    description: "",
    reward_merits: 100,
    reward_token_chain: undefined,
    reward_token_address: "",
    reward_token_amount: undefined,
    twitter_account_url: "",
    twitter_post_url: "",
    twitter_follow_enabled: false,
    twitter_like_enabled: false,
    twitter_retweet_enabled: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eligibleDAOs = userDAOs.filter((dao) => {
    return address && isDAOOwner(address, dao.owner_address);
  });

  const selectedDAO = eligibleDAOs.find((dao) => dao.dao_id === selectedDaoId);

  const handleDAOSelect = (daoId: string) => {
    setSelectedDaoId(daoId);
    setFormData((prev) => ({
      ...prev,
      dao_id: daoId,
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const validateForm = (): string | null => {
    if (!selectedDaoId) {
      return "Please select a DAO";
    }
    if (!formData.title.trim()) {
      return "Title is required";
    }
    if (!formData.description.trim()) {
      return "Description is required";
    }
    if (!formData.start_time) {
      return "Start time is required";
    }
    if (!formData.end_time) {
      return "End time is required";
    }
    if (new Date(formData.start_time) >= new Date(formData.end_time)) {
      return "End time must be after start time";
    }
    if (formData.reward_merits <= 0) {
      return "Reward merits must be greater than 0";
    }
    if (
      !formData.twitter_follow_enabled &&
      !formData.twitter_like_enabled &&
      !formData.twitter_retweet_enabled
    ) {
      return "At least one Twitter action must be enabled";
    }
    if (
      formData.twitter_follow_enabled &&
      !(formData.twitter_account_url || "").trim()
    ) {
      return "Twitter account URL is required when follow is enabled";
    }
    if (
      (formData.twitter_like_enabled || formData.twitter_retweet_enabled) &&
      !(formData.twitter_post_url || "").trim()
    ) {
      return "Twitter post URL is required when like or retweet is enabled";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cleanedData: CreateQuestRequest = {
        ...formData,
        dao_id: selectedDaoId,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        twitter_account_url:
          (formData.twitter_account_url || "").trim() || undefined,
        twitter_post_url: (formData.twitter_post_url || "").trim() || undefined,
        reward_token_address:
          (formData.reward_token_address || "").trim() || undefined,
      };

      await questService.createQuest(cleanedData);
      onQuestCreated();
    } catch (err) {
      console.error("Error creating quest:", err);
      setError(err instanceof Error ? err.message : "Failed to create quest");
    } finally {
      setLoading(false);
    }
  };

  // Set default dates (start: now, end: 7 days from now)
  React.useEffect(() => {
    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    setFormData((prev) => ({
      ...prev,
      start_time: now.toISOString().slice(0, 16),
      end_time: oneWeekLater.toISOString().slice(0, 16),
    }));
  }, []);

  if (userDAOsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your DAOs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (eligibleDAOs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No DAOs Available</CardTitle>
          <CardDescription>
            You need to be a DAO owner to create quests. You don't currently own
            any DAOs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={onCancel}>
            ← Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Twitter Quest</CardTitle>
        <CardDescription>
          Set up a quest for your DAO members to complete Twitter actions and
          earn rewards. Only DAO owners can create quests.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* DAO Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select DAO</h3>
            <p className="text-sm text-muted-foreground">
              Choose which DAO this quest will be created for. You can only
              create quests for DAOs you own.
            </p>

            <div className="grid grid-cols-1 gap-3">
              {eligibleDAOs.map((dao) => (
                <div
                  key={dao.dao_id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedDaoId === dao.dao_id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50 hover:bg-accent/50"
                  }`}
                  onClick={() => handleDAOSelect(dao.dao_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">🏛️</div>
                      <div>
                        <h4 className="font-semibold">{dao.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {dao.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        👑 Owner
                      </Badge>
                      {selectedDaoId === dao.dao_id && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          ✓ Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Show form only if DAO is selected */}
          {selectedDaoId && (
            <>
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium mb-2"
                  >
                    Quest Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Follow our Twitter and like our latest post"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what participants need to do and why..."
                    rows={3}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="start_time"
                      className="block text-sm font-medium mb-2"
                    >
                      Start Time
                    </label>
                    <input
                      id="start_time"
                      name="start_time"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="end_time"
                      className="block text-sm font-medium mb-2"
                    >
                      End Time
                    </label>
                    <input
                      id="end_time"
                      name="end_time"
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Twitter Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Twitter Actions</h3>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      id="twitter_follow_enabled"
                      type="checkbox"
                      checked={formData.twitter_follow_enabled}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "twitter_follow_enabled",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label
                      htmlFor="twitter_follow_enabled"
                      className="text-sm font-medium"
                    >
                      Follow Twitter Account
                    </label>
                  </div>

                  {formData.twitter_follow_enabled && (
                    <div className="ml-6">
                      <label
                        htmlFor="twitter_account_url"
                        className="block text-sm font-medium mb-2"
                      >
                        Twitter Account URL
                      </label>
                      <input
                        id="twitter_account_url"
                        name="twitter_account_url"
                        type="text"
                        value={formData.twitter_account_url || ""}
                        onChange={handleInputChange}
                        placeholder="https://twitter.com/username"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      id="twitter_like_enabled"
                      type="checkbox"
                      checked={formData.twitter_like_enabled}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "twitter_like_enabled",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label
                      htmlFor="twitter_like_enabled"
                      className="text-sm font-medium"
                    >
                      Like Tweet
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="twitter_retweet_enabled"
                      type="checkbox"
                      checked={formData.twitter_retweet_enabled}
                      onChange={(e) =>
                        handleCheckboxChange(
                          "twitter_retweet_enabled",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label
                      htmlFor="twitter_retweet_enabled"
                      className="text-sm font-medium"
                    >
                      Retweet
                    </label>
                  </div>

                  {(formData.twitter_like_enabled ||
                    formData.twitter_retweet_enabled) && (
                    <div className="ml-6">
                      <label
                        htmlFor="twitter_post_url"
                        className="block text-sm font-medium mb-2"
                      >
                        Twitter Post URL
                      </label>
                      <input
                        id="twitter_post_url"
                        name="twitter_post_url"
                        type="text"
                        value={formData.twitter_post_url || ""}
                        onChange={handleInputChange}
                        placeholder="https://twitter.com/username/status/1234567890"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Rewards */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Rewards</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure the rewards that participants will receive upon
                  completing the quest.
                </p>

                <div>
                  <label
                    htmlFor="reward_merits"
                    className="block text-sm font-medium mb-2"
                  >
                    Merit Points
                  </label>
                  <input
                    id="reward_merits"
                    name="reward_merits"
                    type="number"
                    value={formData.reward_merits}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="reward_token_chain"
                      className="block text-sm font-medium mb-2"
                    >
                      Reward Token Chain ID (Optional)
                    </label>
                    <input
                      id="reward_token_chain"
                      name="reward_token_chain"
                      type="number"
                      value={formData.reward_token_chain || ""}
                      onChange={handleInputChange}
                      placeholder="e.g., 1 for Ethereum"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="reward_token_address"
                      className="block text-sm font-medium mb-2"
                    >
                      Reward Token Address (Optional)
                    </label>
                    <input
                      id="reward_token_address"
                      name="reward_token_address"
                      type="text"
                      value={formData.reward_token_address || ""}
                      onChange={handleInputChange}
                      placeholder="0x..."
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="reward_token_amount"
                      className="block text-sm font-medium mb-2"
                    >
                      Reward Token Amount (Optional)
                    </label>
                    <input
                      id="reward_token_amount"
                      name="reward_token_amount"
                      type="number"
                      step="0.01"
                      value={formData.reward_token_amount || ""}
                      onChange={handleInputChange}
                      placeholder="e.g., 10.5"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedDaoId}>
              {loading ? "Creating..." : "Create Quest"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
