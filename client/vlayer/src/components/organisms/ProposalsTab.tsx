import React from "react";
import { ProposalCard } from "../molecules/ProposalCard";
import { Proposal } from "../../types/common";

const mockProposals: Proposal[] = [
  {
    id: "#0db24",
    title: "Governance Proposal: Increase Max Stake for Operators",
    description:
      "Proposal to increase the maximum stake limit for network operators to improve security and decentralization.",
    status: "active",
    votes: 22,
    quorum: "162%",
    timeAgo: "1mo ago",
    author: "0x9223...7E9f",
  },
  {
    id: "#fa0de",
    title:
      "Governance Proposal: Extend the Security Budget with Updated Buyback Stats of $1.4M of CXT in Q1",
    description:
      "Proposal to extend the security budget allocation and implement updated buyback statistics for Q1.",
    status: "active",
    votes: 10,
    quorum: "58.5%",
    timeAgo: "1mo ago",
    author: "0x9223...7E9f",
  },
  {
    id: "#603a2",
    title:
      "Governance Proposal: Increasing the Max Multiplier to 45X to Solve Fragmented Delegation",
    description:
      "Proposal to increase the maximum multiplier to address delegation fragmentation issues.",
    status: "active",
    votes: 28,
    quorum: "105%",
    timeAgo: "4mo ago",
    author: "0x9223...7E9f",
  },
  {
    id: "#83033",
    title:
      "Governance Proposal: Giga-Level Gas Limits are Coming—Achieving Market Equilibrium and Deploying the EWM Light Client on Base",
    description:
      "Proposal for implementing giga-level gas limits and deploying the EWM light client on Base network.",
    status: "active",
    votes: 31,
    quorum: "121%",
    timeAgo: "6mo ago",
    author: "0x9223...7E9f",
  },
];

export const ProposalsTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">PROPOSALS</h2>
      </div>

      {mockProposals.map((proposal) => (
        <ProposalCard key={proposal.id} proposal={proposal} />
      ))}
    </div>
  );
};
