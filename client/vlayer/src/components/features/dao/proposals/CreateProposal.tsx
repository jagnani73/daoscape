import React, { useState } from "react";
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
import { IPFSMetadata } from "../../../ui/IPFSMetadata";
import { OnChainStatusBadge } from "../../../ui/OnChainStatusBadge";
import { governanceService } from "../../../../services/governanceService";
import { useGovernanceContract } from "../../../../hooks/useGovernanceContract";
import { CreateProposalRequest } from "../../../../types/dao";

interface CreateProposalProps {
  daoId: string;
  daoName: string;
  onProposalCreated: () => void;
}

export const CreateProposal: React.FC<CreateProposalProps> = ({
  daoId,
  daoName,
  onProposalCreated,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    voting_start: "",
    voting_end: "",
    feedback_end: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdProposalData, setCreatedProposalData] = useState<any>(null);
  const { address } = useAccount();
  const governanceContract = useGovernanceContract();
  const [onChainStatus, setOnChainStatus] = useState<{
    creation?: "pending" | "success" | "failed" | "api-only";
    message?: string;
  }>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
    if (success) {
      setSuccess(null);
      setCreatedProposalData(null);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return "Title is required";
    if (!formData.description.trim()) return "Description is required";
    if (!formData.voting_start) return "Voting start date is required";
    if (!formData.voting_end) return "Voting end date is required";
    if (!formData.feedback_end) return "Feedback end date is required";

    const votingStart = new Date(formData.voting_start);
    const votingEnd = new Date(formData.voting_end);
    const feedbackEnd = new Date(formData.feedback_end);
    const now = new Date();

    if (votingStart <= now) return "Voting start must be in the future";
    if (votingEnd <= votingStart)
      return "Voting end must be after voting start";
    if (feedbackEnd <= votingEnd)
      return "Feedback end must be after voting end";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!address) {
      setError("Please connect your wallet to create proposals");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setOnChainStatus({ creation: "pending" });

    try {
      const proposalData: CreateProposalRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        dao_id: daoId,
        voting_start: new Date(formData.voting_start).toISOString(),
        voting_end: new Date(formData.voting_end).toISOString(),
        feedback_end: new Date(formData.feedback_end).toISOString(),
      };

      const result = await governanceService.createHybridProposal(
        proposalData,
        {
          daoId: daoId,
          proposalId: "",
          title: formData.title.trim(),
          creator: address,
          startTime: new Date(formData.voting_start),
          endTime: new Date(formData.voting_end),
        },
        {
          createProposal: governanceContract.createProposal,
        }
      );

      if (result.success) {
        // Store the created proposal data for IPFS display
        setCreatedProposalData(result.data);

        // Update on-chain status based on response
        if (result.onChainCreated) {
          setOnChainStatus({ creation: "success" });
          setSuccess("✅ Proposal created successfully!");
        } else if (result.onChainError) {
          setOnChainStatus({
            creation: "failed",
            message: result.onChainError,
          });
          setSuccess(
            "✅ Proposal created in backend (on-chain creation failed)"
          );
        } else {
          setOnChainStatus({ creation: "api-only" });
          setSuccess("Proposal created successfully!");
        }

        setFormData({
          title: "",
          description: "",
          voting_start: "",
          voting_end: "",
          feedback_end: "",
        });
        onProposalCreated();
      } else {
        setOnChainStatus({ creation: "failed", message: result.message });
        setError(result.message || "Failed to create proposal");
      }
    } catch (error) {
      setOnChainStatus({ creation: "failed", message: "Transaction failed" });
      setError(
        error instanceof Error ? error.message : "Failed to create proposal"
      );
    } finally {
      setIsSubmitting(false);
      // Clear on-chain status after 10 seconds for proposals (longer than votes)
      setTimeout(() => setOnChainStatus({}), 10000);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5); // Minimum 5 minutes from now
    return now.toISOString().slice(0, 16);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <CardTitle>Create New Proposal</CardTitle>
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            Owner Only
          </Badge>
        </div>
        <CardDescription>
          Create a new proposal for {daoName} members to vote on
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Proposal Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter proposal title..."
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your proposal in detail..."
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
              rows={4}
              required
            />
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Voting Start *
              </label>
              <input
                type="datetime-local"
                name="voting_start"
                value={formData.voting_start}
                onChange={handleInputChange}
                min={getMinDateTime()}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Voting End *
              </label>
              <input
                type="datetime-local"
                name="voting_end"
                value={formData.voting_end}
                onChange={handleInputChange}
                min={formData.voting_start || getMinDateTime()}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Feedback End *
              </label>
              <input
                type="datetime-local"
                name="feedback_end"
                value={formData.feedback_end}
                onChange={handleInputChange}
                min={formData.voting_end || getMinDateTime()}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              />
            </div>
          </div>

          {/* On-chain status indicator */}
          {onChainStatus.creation && (
            <div className="flex justify-center">
              <OnChainStatusBadge
                status={onChainStatus.creation}
                message={onChainStatus.message}
              />
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="space-y-3">
              <div className="p-3 rounded-md bg-green-50 border border-green-200">
                <p className="text-sm text-green-800">{success}</p>
              </div>
              {/* Show IPFS metadata if available */}
              {createdProposalData?.akave_url && (
                <IPFSMetadata akaveUrl={createdProposalData.akave_url} />
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating Proposal..." : "Create Proposal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
