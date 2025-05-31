// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract Governance {
    struct Proposal {
        string title;
        address creator;
        bool active;
        uint256 startTime;
        uint256 endTime;
    }

    struct Vote {
        address voter;
        string daoId;
        string proposalId;
        uint8 voteType; // 0 = no, 1 = yes, 2 = abstain
    }

    mapping(string => mapping(string => Proposal)) public proposals;

    Vote[] public votes;

    mapping(address => mapping(string => mapping(string => bool)))
        public hasVoted;

    mapping(string => string[]) public daoProposals;

    event ProposalCreated(
        string indexed daoId,
        string indexed proposalId,
        string title,
        address indexed creator,
        uint256 startTime,
        uint256 endTime
    );

    event VoteCasted(
        string indexed daoId,
        string indexed proposalId,
        address indexed voter,
        uint8 voteType
    );

    event ProposalDeactivated(
        string indexed daoId,
        string indexed proposalId,
        address indexed deactivatedBy
    );

    function createProposal(
        string memory _daoId,
        string memory _proposalId,
        string memory _title,
        address _creator,
        uint256 _startTime,
        uint256 _endTime
    ) external returns (string memory) {
        require(bytes(_daoId).length > 0, "DAO ID cannot be empty");
        require(bytes(_proposalId).length > 0, "Proposal ID cannot be empty");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_endTime > _startTime, "End time must be after start time");
        require(
            _startTime >= block.timestamp,
            "Start time must be in the future"
        );
        require(
            !proposals[_daoId][_proposalId].active &&
                bytes(proposals[_daoId][_proposalId].title).length == 0,
            "Proposal already exists"
        );

        Proposal storage newProposal = proposals[_daoId][_proposalId];
        newProposal.title = _title;
        newProposal.creator = _creator;
        newProposal.active = true;
        newProposal.startTime = _startTime;
        newProposal.endTime = _endTime;

        daoProposals[_daoId].push(_proposalId);

        emit ProposalCreated(
            _daoId,
            _proposalId,
            _title,
            _creator,
            _startTime,
            _endTime
        );

        return _proposalId;
    }

    function voteYes(string memory _daoId, string memory _proposalId) external {
        _vote(_daoId, _proposalId, 1);
    }

    function voteNo(string memory _daoId, string memory _proposalId) external {
        _vote(_daoId, _proposalId, 0);
    }

    function voteAbstain(
        string memory _daoId,
        string memory _proposalId
    ) external {
        _vote(_daoId, _proposalId, 2);
    }

    function _vote(
        string memory _daoId,
        string memory _proposalId,
        uint8 _voteType
    ) internal {
        require(bytes(_daoId).length > 0, "DAO ID cannot be empty");
        require(bytes(_proposalId).length > 0, "Proposal ID cannot be empty");
        require(
            proposals[_daoId][_proposalId].active,
            "Proposal is not active"
        );
        require(
            block.timestamp >= proposals[_daoId][_proposalId].startTime,
            "Voting has not started yet"
        );
        require(
            block.timestamp <= proposals[_daoId][_proposalId].endTime,
            "Voting has ended"
        );
        require(
            !hasVoted[msg.sender][_daoId][_proposalId],
            "You have already voted on this proposal"
        );

        hasVoted[msg.sender][_daoId][_proposalId] = true;

        votes.push(
            Vote({
                voter: msg.sender,
                daoId: _daoId,
                proposalId: _proposalId,
                voteType: _voteType
            })
        );

        emit VoteCasted(_daoId, _proposalId, msg.sender, _voteType);
    }

    function getVoteCounts(
        string memory _daoId,
        string memory _proposalId
    )
        external
        view
        returns (uint256 yesVotes, uint256 noVotes, uint256 abstainVotes)
    {
        for (uint256 i = 0; i < votes.length; i++) {
            if (
                keccak256(bytes(votes[i].daoId)) == keccak256(bytes(_daoId)) &&
                keccak256(bytes(votes[i].proposalId)) ==
                keccak256(bytes(_proposalId))
            ) {
                if (votes[i].voteType == 1) {
                    yesVotes++;
                } else if (votes[i].voteType == 0) {
                    noVotes++;
                } else if (votes[i].voteType == 2) {
                    abstainVotes++;
                }
            }
        }
    }

    function getAddressVote(
        address _voter,
        string memory _daoId,
        string memory _proposalId
    ) external view returns (bool hasVotedOnProposal, uint8 voteType) {
        hasVotedOnProposal = hasVoted[_voter][_daoId][_proposalId];

        if (hasVotedOnProposal) {
            for (uint256 i = 0; i < votes.length; i++) {
                if (
                    votes[i].voter == _voter &&
                    keccak256(bytes(votes[i].daoId)) ==
                    keccak256(bytes(_daoId)) &&
                    keccak256(bytes(votes[i].proposalId)) ==
                    keccak256(bytes(_proposalId))
                ) {
                    voteType = votes[i].voteType;
                    break;
                }
            }
        }
    }

    // Function to get all voters and their votes for a specific proposal
    function getProposalVoters(
        string memory _daoId,
        string memory _proposalId
    )
        external
        view
        returns (address[] memory voters, uint8[] memory voteTypes)
    {
        // First, count how many votes this proposal has
        uint256 voteCount = 0;
        for (uint256 i = 0; i < votes.length; i++) {
            if (
                keccak256(bytes(votes[i].daoId)) == keccak256(bytes(_daoId)) &&
                keccak256(bytes(votes[i].proposalId)) ==
                keccak256(bytes(_proposalId))
            ) {
                voteCount++;
            }
        }

        // Create arrays with the correct size
        voters = new address[](voteCount);
        voteTypes = new uint8[](voteCount);

        // Fill the arrays
        uint256 index = 0;
        for (uint256 i = 0; i < votes.length; i++) {
            if (
                keccak256(bytes(votes[i].daoId)) == keccak256(bytes(_daoId)) &&
                keccak256(bytes(votes[i].proposalId)) ==
                keccak256(bytes(_proposalId))
            ) {
                voters[index] = votes[i].voter;
                voteTypes[index] = votes[i].voteType;
                index++;
            }
        }
    }

    // Function to get all proposal IDs for a DAO
    function getDaoProposals(
        string memory _daoId
    ) external view returns (string[] memory) {
        return daoProposals[_daoId];
    }

    // Function to get proposal details
    function getProposal(
        string memory _daoId,
        string memory _proposalId
    )
        external
        view
        returns (
            string memory title,
            address creator,
            bool active,
            uint256 startTime,
            uint256 endTime
        )
    {
        Proposal storage proposal = proposals[_daoId][_proposalId];
        return (
            proposal.title,
            proposal.creator,
            proposal.active,
            proposal.startTime,
            proposal.endTime
        );
    }

    // Function to check if a proposal exists
    function proposalExists(
        string memory _daoId,
        string memory _proposalId
    ) external view returns (bool) {
        return bytes(proposals[_daoId][_proposalId].title).length > 0;
    }

    // Function to get total number of votes
    function getTotalVotes() external view returns (uint256) {
        return votes.length;
    }

    // Function to get total number of proposals for a DAO
    function getDaoProposalCount(
        string memory _daoId
    ) external view returns (uint256) {
        return daoProposals[_daoId].length;
    }

    // Function to deactivate a proposal (only creator can call)
    function deactivateProposal(
        string memory _daoId,
        string memory _proposalId
    ) external {
        require(
            bytes(proposals[_daoId][_proposalId].title).length > 0,
            "Proposal does not exist"
        );
        require(
            proposals[_daoId][_proposalId].creator == msg.sender,
            "Only creator can deactivate"
        );
        require(
            proposals[_daoId][_proposalId].active,
            "Proposal is already inactive"
        );

        proposals[_daoId][_proposalId].active = false;

        emit ProposalDeactivated(_daoId, _proposalId, msg.sender);
    }

    // Function to check if voting is currently active for a proposal
    function isVotingActive(
        string memory _daoId,
        string memory _proposalId
    ) external view returns (bool) {
        Proposal storage proposal = proposals[_daoId][_proposalId];
        return
            proposal.active &&
            block.timestamp >= proposal.startTime &&
            block.timestamp <= proposal.endTime;
    }
}
