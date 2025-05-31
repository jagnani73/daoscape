// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Verifier} from "vlayer-0.1.0/Verifier.sol";
import {GitHubProver} from "./GitHubProver.sol";

contract GitHubVerifier is Verifier {
    address public prover;

    // Event emitted when a GitHub commit is verified
    event GitHubCommitVerified(
        address indexed account,
        string username,
        string repoOwner,
        string repoName,
        string branch,
        bool verified,
        string resultMessage
    );

    // Event emitted when multiple GitHub commits are verified
    event MultipleGitHubCommitsVerified(
        address[] accounts,
        string[] usernames,
        string repoOwner,
        string repoName,
        string branch,
        bool[] results
    );

    // Struct to store verification results
    struct GitHubVerificationResult {
        address account;
        string username;
        string repoOwner;
        string repoName;
        string branch;
        bool verified;
        string resultMessage;
        uint256 timestamp;
    }

    // Struct to store multiple verification results
    struct MultipleGitHubVerificationResult {
        address[] accounts;
        string[] usernames;
        string repoOwner;
        string repoName;
        string branch;
        bool[] results;
        string[] resultMessages;
        uint256 timestamp;
    }

    // Mapping to store verification results by account
    mapping(address => GitHubVerificationResult[]) public verificationHistory;

    // Mapping to store multiple verification results
    mapping(bytes32 => MultipleGitHubVerificationResult)
        public multipleVerificationResults;

    // Counter for verification IDs
    uint256 public verificationCounter;

    constructor(address _prover) {
        prover = _prover;
    }

    // Function to verify a single GitHub commit
    function verifyGitHubCommit(
        Proof calldata proof,
        bool verified,
        string memory resultMessage,
        address account,
        string memory username,
        string memory repoOwner,
        string memory repoName,
        string memory branch
    ) external onlyVerified(prover, GitHubProver.verifyGitHubCommit.selector) {
        GitHubVerificationResult memory result = GitHubVerificationResult({
            account: account,
            username: username,
            repoOwner: repoOwner,
            repoName: repoName,
            branch: branch,
            verified: verified,
            resultMessage: resultMessage,
            timestamp: block.timestamp
        });

        verificationHistory[account].push(result);
        verificationCounter++;

        // Emit event
        emit GitHubCommitVerified(
            account,
            username,
            repoOwner,
            repoName,
            branch,
            verified,
            resultMessage
        );
    }

    // Function to verify multiple GitHub commits
    function verifyMultipleGitHubCommits(
        Proof calldata proof,
        bool[] memory results,
        string[] memory resultMessages,
        address[] memory accounts,
        string[] memory usernames,
        string memory repoOwner,
        string memory repoName,
        string memory branch
    )
        external
        onlyVerified(prover, GitHubProver.verifyMultipleGitHubCommits.selector)
    {
        require(results.length == accounts.length, "Mismatched array lengths");
        require(
            usernames.length == accounts.length,
            "Mismatched array lengths"
        );
        require(
            resultMessages.length == accounts.length,
            "Mismatched array lengths"
        );

        // Generate a unique ID for this verification batch
        bytes32 verificationId = keccak256(
            abi.encodePacked(
                block.timestamp,
                verificationCounter,
                repoOwner,
                repoName,
                branch
            )
        );

        // Store the multiple verification result
        MultipleGitHubVerificationResult
            storage multiResult = multipleVerificationResults[verificationId];
        multiResult.accounts = accounts;
        multiResult.usernames = usernames;
        multiResult.repoOwner = repoOwner;
        multiResult.repoName = repoName;
        multiResult.branch = branch;
        multiResult.results = results;
        multiResult.resultMessages = resultMessages;
        multiResult.timestamp = block.timestamp;

        // Store individual results in verification history
        for (uint256 i = 0; i < accounts.length; i++) {
            GitHubVerificationResult
                memory individualResult = GitHubVerificationResult({
                    account: accounts[i],
                    username: usernames[i],
                    repoOwner: repoOwner,
                    repoName: repoName,
                    branch: branch,
                    verified: results[i],
                    resultMessage: resultMessages[i],
                    timestamp: block.timestamp
                });

            verificationHistory[accounts[i]].push(individualResult);
        }

        verificationCounter++;

        // Emit event
        emit MultipleGitHubCommitsVerified(
            accounts,
            usernames,
            repoOwner,
            repoName,
            branch,
            results
        );
    }

    // View function to get verification history for an account
    function getVerificationHistory(
        address account
    ) external view returns (GitHubVerificationResult[] memory) {
        return verificationHistory[account];
    }

    // View function to get the latest verification for an account
    function getLatestVerification(
        address account
    ) external view returns (GitHubVerificationResult memory) {
        require(
            verificationHistory[account].length > 0,
            "No verification history found"
        );
        return
            verificationHistory[account][
                verificationHistory[account].length - 1
            ];
    }

    // View function to check if an account has verified commits for a specific repo
    function hasVerifiedCommitsForRepo(
        address account,
        string memory repoOwner,
        string memory repoName
    ) external view returns (bool) {
        GitHubVerificationResult[] memory history = verificationHistory[
            account
        ];

        for (uint256 i = 0; i < history.length; i++) {
            if (
                keccak256(abi.encodePacked(history[i].repoOwner)) ==
                keccak256(abi.encodePacked(repoOwner)) &&
                keccak256(abi.encodePacked(history[i].repoName)) ==
                keccak256(abi.encodePacked(repoName)) &&
                history[i].verified
            ) {
                return true;
            }
        }

        return false;
    }

    // View function to get verification count for an account
    function getVerificationCount(
        address account
    ) external view returns (uint256) {
        return verificationHistory[account].length;
    }

    // View function to get multiple verification result by ID
    function getMultipleVerificationResult(
        bytes32 verificationId
    ) external view returns (MultipleGitHubVerificationResult memory) {
        return multipleVerificationResults[verificationId];
    }

    // View function to check if a username has verified commits for a specific repo
    function hasUsernameVerifiedCommitsForRepo(
        string memory username,
        string memory repoOwner,
        string memory repoName
    ) external view returns (bool, address) {
        for (uint256 i = 0; i < 100 && i < verificationCounter; i++) {
            bytes32 verificationId = keccak256(
                abi.encodePacked(
                    block.timestamp - (i * 3600),
                    verificationCounter - i,
                    repoOwner,
                    repoName,
                    "main"
                )
            );

            MultipleGitHubVerificationResult
                storage multiResult = multipleVerificationResults[
                    verificationId
                ];

            if (
                keccak256(abi.encodePacked(multiResult.repoOwner)) ==
                keccak256(abi.encodePacked(repoOwner)) &&
                keccak256(abi.encodePacked(multiResult.repoName)) ==
                keccak256(abi.encodePacked(repoName))
            ) {
                for (uint256 j = 0; j < multiResult.usernames.length; j++) {
                    if (
                        keccak256(abi.encodePacked(multiResult.usernames[j])) ==
                        keccak256(abi.encodePacked(username)) &&
                        multiResult.results[j]
                    ) {
                        return (true, multiResult.accounts[j]);
                    }
                }
            }
        }

        return (false, address(0));
    }

    function hasUsernameVerifiedCommitsForRepoWithAccount(
        string memory username,
        string memory repoOwner,
        string memory repoName,
        address account
    ) external view returns (bool) {
        GitHubVerificationResult[] memory history = verificationHistory[
            account
        ];

        for (uint256 i = 0; i < history.length; i++) {
            if (
                keccak256(abi.encodePacked(history[i].username)) ==
                keccak256(abi.encodePacked(username)) &&
                keccak256(abi.encodePacked(history[i].repoOwner)) ==
                keccak256(abi.encodePacked(repoOwner)) &&
                keccak256(abi.encodePacked(history[i].repoName)) ==
                keccak256(abi.encodePacked(repoName)) &&
                history[i].verified
            ) {
                return true;
            }
        }

        return false;
    }

    function getVerifiedContributorsForRepo(
        string memory repoOwner,
        string memory repoName
    )
        external
        view
        returns (address[] memory contributors, string[] memory usernames)
    {
        address[] memory tempContributors = new address[](1000);
        string[] memory tempUsernames = new string[](1000);
        uint256 contributorCount = 0;

        for (uint256 i = 0; i < 50 && i < verificationCounter; i++) {
            bytes32 verificationId = keccak256(
                abi.encodePacked(
                    block.timestamp - (i * 3600),
                    verificationCounter - i,
                    repoOwner,
                    repoName,
                    "main"
                )
            );

            MultipleGitHubVerificationResult
                storage multiResult = multipleVerificationResults[
                    verificationId
                ];

            if (
                keccak256(abi.encodePacked(multiResult.repoOwner)) ==
                keccak256(abi.encodePacked(repoOwner)) &&
                keccak256(abi.encodePacked(multiResult.repoName)) ==
                keccak256(abi.encodePacked(repoName))
            ) {
                for (
                    uint256 j = 0;
                    j < multiResult.usernames.length && contributorCount < 1000;
                    j++
                ) {
                    if (multiResult.results[j]) {
                        bool alreadyExists = false;
                        for (uint256 k = 0; k < contributorCount; k++) {
                            if (
                                tempContributors[k] == multiResult.accounts[j]
                            ) {
                                alreadyExists = true;
                                break;
                            }
                        }

                        if (!alreadyExists) {
                            tempContributors[contributorCount] = multiResult
                                .accounts[j];
                            tempUsernames[contributorCount] = multiResult
                                .usernames[j];
                            contributorCount++;
                        }
                    }
                }
            }
        }

        // Create properly sized return arrays
        contributors = new address[](contributorCount);
        usernames = new string[](contributorCount);

        for (uint256 i = 0; i < contributorCount; i++) {
            contributors[i] = tempContributors[i];
            usernames[i] = tempUsernames[i];
        }

        return (contributors, usernames);
    }
}
