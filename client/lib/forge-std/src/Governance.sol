pragma solidity ^0.8.7;

contract Proposals {
    // Struct to represent a proposal
    struct Proposal {
        uint256 id;
        string title;
        address creator;
        bool active;
        uint256 startTime;
        uint256 endTime;
    }

    // Struct to represent a vote
    struct Vote {
        address voter;
        uint256 proposalId;
        uint8 voteType; // 0 = no, 1 = yes, 2 = abstain
    }

    // Counter for proposal IDs
    uint256 private proposalId = 1;

    // Mapping of proposals by ID
    mapping(uint256 => Proposal) public proposals;

    // Array to store all votes
    Vote[] public votes;

    // Mapping to track if an address has voted on a specific proposal
    mapping(address => mapping(uint256 => bool)) public hasVoted;

    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        string title,
        address indexed creator,
        uint256 startTime,
        uint256 endTime
    );
    event VoteCasted(
        uint256 indexed proposalId,
        address indexed voter,
        uint8 voteType
    );

    function createProposal(
        string memory _title,
        address _creator,
        uint256 _startTime,
        uint256 _endTime
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_endTime > _startTime, "End time must be after start time");
        require(
            _startTime >= block.timestamp,
            "Start time must be in the future"
        );

        Proposal storage newProposal = proposals[proposalId];
        newProposal.id = proposalId;
        newProposal.title = _title;
        newProposal.creator = _creator;
        newProposal.active = true;
        newProposal.startTime = _startTime;
        newProposal.endTime = _endTime;

        emit ProposalCreated(
            proposalId,
            _title,
            _creator,
            _startTime,
            _endTime
        );

        // Increment the proposal ID for next proposal
        proposalId++;

        return newProposal.id;
    }

    function voteYes(uint256 _proposalId) external {
        _vote(_proposalId, 1);
    }

    function voteNo(uint256 _proposalId) external {
        _vote(_proposalId, 0);
    }

    function voteAbstain(uint256 _proposalId) external {
        _vote(_proposalId, 2);
    }

    function _vote(uint256 _proposalId, uint8 _voteType) internal {
        require(proposals[_proposalId].id != 0, "Proposal does not exist");
        require(proposals[_proposalId].active, "Proposal is not active");
        require(
            block.timestamp >= proposals[_proposalId].startTime,
            "Voting has not started yet"
        );
        require(
            block.timestamp <= proposals[_proposalId].endTime,
            "Voting has ended"
        );
        require(
            !hasVoted[msg.sender][_proposalId],
            "You have already voted on this proposal"
        );

        // Mark that this address has voted on this proposal
        hasVoted[msg.sender][_proposalId] = true;

        // Add vote to the votes array
        votes.push(
            Vote({
                voter: msg.sender,
                proposalId: _proposalId,
                voteType: _voteType
            })
        );

        emit VoteCasted(_proposalId, msg.sender, _voteType);
    }

    // Helper function to get vote counts for a proposal
    function getVoteCounts(
        uint256 _proposalId
    )
        external
        view
        returns (uint256 yesVotes, uint256 noVotes, uint256 abstainVotes)
    {
        for (uint256 i = 0; i < votes.length; i++) {
            if (votes[i].proposalId == _proposalId) {
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

    // Function to get what vote a specific address made on a proposal
    function getAddressVote(
        address _voter,
        uint256 _proposalId
    ) external view returns (bool hasVotedOnProposal, uint8 voteType) {
        hasVotedOnProposal = hasVoted[_voter][_proposalId];

        if (hasVotedOnProposal) {
            // Find the vote in the votes array
            for (uint256 i = 0; i < votes.length; i++) {
                if (
                    votes[i].voter == _voter &&
                    votes[i].proposalId == _proposalId
                ) {
                    voteType = votes[i].voteType;
                    break;
                }
            }
        }
    }

    // Function to get all voters and their votes for a specific proposal
    function getProposalVoters(
        uint256 _proposalId
    )
        external
        view
        returns (address[] memory voters, uint8[] memory voteTypes)
    {
        // First, count how many votes this proposal has
        uint256 voteCount = 0;
        for (uint256 i = 0; i < votes.length; i++) {
            if (votes[i].proposalId == _proposalId) {
                voteCount++;
            }
        }

        // Create arrays with the correct size
        voters = new address[](voteCount);
        voteTypes = new uint8[](voteCount);

        // Fill the arrays
        uint256 index = 0;
        for (uint256 i = 0; i < votes.length; i++) {
            if (votes[i].proposalId == _proposalId) {
                voters[index] = votes[i].voter;
                voteTypes[index] = votes[i].voteType;
                index++;
            }
        }
    }

    // Function to get total number of votes
    function getTotalVotes() external view returns (uint256) {
        return votes.length;
    }

    // Function to deactivate a proposal (only creator can call)
    function deactivateProposal(uint256 _proposalId) external {
        require(proposals[_proposalId].id != 0, "Proposal does not exist");
        require(
            proposals[_proposalId].creator == msg.sender,
            "Only creator can deactivate"
        );
        proposals[_proposalId].active = false;
    }
}
