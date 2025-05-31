// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Prover} from "vlayer-0.1.0/Prover.sol";
import {Web, WebProof, WebProofLib, WebLib} from "vlayer-0.1.0/WebProof.sol";

contract GitHubProver is Prover {
    using WebProofLib for WebProof;
    using WebLib for Web;

    enum GitHubActionType {
        COMMIT_VERIFICATION
    }

    struct GitHubActionConfig {
        GitHubActionType actionType;
        string baseUrl;
        string jsonPath;
        bool isActive;
    }

    mapping(uint256 => GitHubActionConfig) public gitHubActionConfigs;
    uint256 public gitHubActionConfigCount;

    constructor() {
        _initializeDefaultGitHubActions();
    }

    function _initializeDefaultGitHubActions() internal {
        gitHubActionConfigs[0] = GitHubActionConfig({
            actionType: GitHubActionType.COMMIT_VERIFICATION,
            baseUrl: "https://github.com/",
            jsonPath: "authors",
            isActive: true
        });

        gitHubActionConfigCount = 1;
    }

    function verifyGitHubCommit(
        WebProof calldata webProof,
        string memory repoOwner,
        string memory repoName,
        string memory branch,
        string memory username,
        address account
    )
        public
        view
        returns (
            Proof memory,
            bool,
            string memory,
            address,
            string memory,
            string memory,
            string memory,
            string memory
        )
    {
        require(
            gitHubActionConfigs[0].isActive,
            "GitHub commit verification is not active"
        );

        GitHubActionConfig memory config = gitHubActionConfigs[0];

        string memory fullUrl = _buildGitHubCommitsUrl(
            repoOwner,
            repoName,
            branch
        );

        Web memory web = webProof.verifyWithUrlPrefix(fullUrl);

        // Check if the username exists in the authors array
        bool commitVerified = _checkUserInAuthors(web, username);

        string memory resultMessage = commitVerified
            ? "User has committed to the repository"
            : "User has not committed to the repository";

        return (
            proof(),
            commitVerified,
            resultMessage,
            account,
            username,
            repoOwner,
            repoName,
            branch
        );
    }

    // Helper function to check if user exists in authors array
    function _checkUserInAuthors(
        Web memory web,
        string memory username
    ) internal view returns (bool) {
        string memory loginsJson = web.jsonGetString("authors[*].login");

        return _containsUsername(loginsJson, username);
    }

    function _containsUsername(
        string memory loginsJson,
        string memory username
    ) internal pure returns (bool) {
        bytes memory loginsBytes = bytes(loginsJson);
        bytes memory usernameBytes = bytes(username);

        string memory quotedUsername = string(
            abi.encodePacked('"', username, '"')
        );
        bytes memory quotedUsernameBytes = bytes(quotedUsername);

        if (quotedUsernameBytes.length > loginsBytes.length) {
            return false;
        }

        for (
            uint i = 0;
            i <= loginsBytes.length - quotedUsernameBytes.length;
            i++
        ) {
            bool found = true;
            for (uint j = 0; j < quotedUsernameBytes.length; j++) {
                if (loginsBytes[i + j] != quotedUsernameBytes[j]) {
                    found = false;
                    break;
                }
            }
            if (found) {
                return true;
            }
        }

        return false;
    }

    // Helper function to build GitHub commits URL
    function _buildGitHubCommitsUrl(
        string memory repoOwner,
        string memory repoName,
        string memory branch
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "https://github.com/",
                    repoOwner,
                    "/",
                    repoName,
                    "/commits/",
                    branch
                )
            );
    }

    // Helper function to convert uint to string
    function _uintToString(
        uint256 value
    ) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }

        uint256 temp = value;
        uint256 digits;

        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory buffer = new bytes(digits);

        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }

        return string(buffer);
    }

    // Function to verify multiple users at once
    function verifyMultipleGitHubCommits(
        WebProof calldata webProof,
        string memory repoOwner,
        string memory repoName,
        string memory branch,
        string[] memory usernames,
        address[] memory accounts
    )
        public
        view
        returns (
            Proof memory,
            bool[] memory,
            string[] memory,
            address[] memory,
            string[] memory,
            string memory,
            string memory,
            string memory
        )
    {
        require(
            usernames.length == accounts.length,
            "Mismatched array lengths"
        );
        require(
            gitHubActionConfigs[0].isActive,
            "GitHub commit verification is not active"
        );

        GitHubActionConfig memory config = gitHubActionConfigs[0];

        // Build the GitHub commits API URL
        string memory fullUrl = _buildGitHubCommitsUrl(
            repoOwner,
            repoName,
            branch
        );

        Web memory web = webProof.verifyWithUrlPrefix(fullUrl);

        bool[] memory results = new bool[](usernames.length);
        string[] memory resultMessages = new string[](usernames.length);

        for (uint256 i = 0; i < usernames.length; i++) {
            results[i] = _checkUserInAuthors(web, usernames[i]);
            resultMessages[i] = results[i]
                ? "User has committed to the repository"
                : "User has not committed to the repository";
        }

        return (
            proof(),
            results,
            resultMessages,
            accounts,
            usernames,
            repoOwner,
            repoName,
            branch
        );
    }

    // Admin functions to manage GitHub action configurations
    function updateGitHubActionConfig(
        uint256 actionId,
        string memory baseUrl,
        string memory jsonPath,
        bool isActive
    ) external {
        require(actionId < gitHubActionConfigCount, "Invalid action ID");
        GitHubActionConfig storage config = gitHubActionConfigs[actionId];
        config.baseUrl = baseUrl;
        config.jsonPath = jsonPath;
        config.isActive = isActive;
    }

    function toggleGitHubActionConfig(uint256 actionId) external {
        require(actionId < gitHubActionConfigCount, "Invalid action ID");
        gitHubActionConfigs[actionId].isActive = !gitHubActionConfigs[actionId]
            .isActive;
    }

    // View functions
    function getGitHubActionConfig(
        uint256 actionId
    ) external view returns (GitHubActionConfig memory) {
        require(actionId < gitHubActionConfigCount, "Invalid action ID");
        return gitHubActionConfigs[actionId];
    }

    function getAllActiveGitHubActions()
        external
        view
        returns (uint256[] memory)
    {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < gitHubActionConfigCount; i++) {
            if (gitHubActionConfigs[i].isActive) {
                activeCount++;
            }
        }

        uint256[] memory activeActions = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < gitHubActionConfigCount; i++) {
            if (gitHubActionConfigs[i].isActive) {
                activeActions[index] = i;
                index++;
            }
        }

        return activeActions;
    }
}
