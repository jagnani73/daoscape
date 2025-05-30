// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {DynamicTwitterProver} from "./DynamicTwitterProver.sol";
import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Verifier} from "vlayer-0.1.0/Verifier.sol";

contract DynamicTwitterVerifier is Verifier {
    address public prover;

    // User data structure
    struct UserData {
        string username;
        address userAddress;
        uint256 totalActionsVerified;
        uint256 lastVerificationTimestamp;
        bool isActive;
    }

    // Action verification record
    struct ActionRecord {
        uint256 actionId;
        string actionName;
        string targetValue;
        bool verified;
        uint256 timestamp;
        string actualValue;
    }

    // Mappings for user data tracking
    mapping(address => UserData) public userData;
    mapping(address => mapping(uint256 => ActionRecord[]))
        public userActionHistory;
    mapping(address => mapping(uint256 => bool)) public userActionStatus;
    mapping(string => address) public usernameToAddress;

    // Global tracking
    address[] public verifiedUsers;
    mapping(uint256 => uint256) public actionVerificationCounts;

    // Events
    event UserVerified(address indexed user, string username);
    event ActionVerified(
        address indexed user,
        uint256 indexed actionId,
        string targetValue,
        bool success
    );
    event MultipleActionsVerified(
        address indexed user,
        uint256[] actionIds,
        bool[] results
    );
    event UserDataUpdated(address indexed user, string username);

    constructor(address _prover) {
        prover = _prover;
    }

    // Single action verification
    function verifySingleAction(
        Proof calldata,
        bool actionVerified,
        string memory actualValue,
        address account,
        uint256 actionId,
        string memory username,
        string memory targetValue
    ) public onlyVerified(prover, DynamicTwitterProver.verifyAction.selector) {
        require(account != address(0), "Invalid account address");

        // Update or create user data
        _updateUserData(account, username);

        // Record the action
        ActionRecord memory newRecord = ActionRecord({
            actionId: actionId,
            actionName: _getActionName(actionId),
            targetValue: targetValue,
            verified: actionVerified,
            timestamp: block.timestamp,
            actualValue: actualValue
        });

        userActionHistory[account][actionId].push(newRecord);
        userActionStatus[account][actionId] = actionVerified;

        if (actionVerified) {
            userData[account].totalActionsVerified++;
            actionVerificationCounts[actionId]++;
        }

        userData[account].lastVerificationTimestamp = block.timestamp;

        emit ActionVerified(account, actionId, targetValue, actionVerified);
    }

    // Multiple actions verification
    function verifyMultipleActions(
        Proof calldata,
        bool[] memory results,
        string[] memory actualValues,
        address account,
        uint256[] memory actionIds,
        string memory username,
        string[] memory targetValues
    )
        public
        onlyVerified(
            prover,
            DynamicTwitterProver.verifyMultipleActions.selector
        )
    {
        require(account != address(0), "Invalid account address");
        require(actionIds.length == results.length, "Array length mismatch");
        require(
            actionIds.length == targetValues.length,
            "Array length mismatch"
        );
        require(
            actionIds.length == actualValues.length,
            "Array length mismatch"
        );

        // Update or create user data
        _updateUserData(account, username);

        uint256 successfulActions = 0;

        for (uint256 i = 0; i < actionIds.length; i++) {
            ActionRecord memory newRecord = ActionRecord({
                actionId: actionIds[i],
                actionName: _getActionName(actionIds[i]),
                targetValue: targetValues[i],
                verified: results[i],
                timestamp: block.timestamp,
                actualValue: actualValues[i]
            });

            userActionHistory[account][actionIds[i]].push(newRecord);
            userActionStatus[account][actionIds[i]] = results[i];

            if (results[i]) {
                successfulActions++;
                actionVerificationCounts[actionIds[i]]++;
            }
        }

        userData[account].totalActionsVerified += successfulActions;
        userData[account].lastVerificationTimestamp = block.timestamp;

        emit MultipleActionsVerified(account, actionIds, results);
    }

    // Internal function to update user data
    function _updateUserData(address account, string memory username) internal {
        if (!userData[account].isActive) {
            // New user
            userData[account] = UserData({
                username: username,
                userAddress: account,
                totalActionsVerified: 0,
                lastVerificationTimestamp: block.timestamp,
                isActive: true
            });

            verifiedUsers.push(account);
            usernameToAddress[username] = account;

            emit UserVerified(account, username);
        } else {
            // Update existing user
            if (
                keccak256(abi.encodePacked(userData[account].username)) !=
                keccak256(abi.encodePacked(username))
            ) {
                // Username changed, update mapping
                delete usernameToAddress[userData[account].username];
                usernameToAddress[username] = account;
                userData[account].username = username;

                emit UserDataUpdated(account, username);
            }
        }
    }

    // Helper function to get action name
    function _getActionName(
        uint256 actionId
    ) internal pure returns (string memory) {
        if (actionId == 0) return "Profile Verification";
        if (actionId == 1) return "Follow User";
        if (actionId == 2) return "Like Post";
        if (actionId == 3) return "Retweet Post";
        return "Unknown Action";
    }

    // View functions for UI integration
    function getUserData(address user) external view returns (UserData memory) {
        return userData[user];
    }

    function getUserActionHistory(
        address user,
        uint256 actionId
    ) external view returns (ActionRecord[] memory) {
        return userActionHistory[user][actionId];
    }

    function getUserActionStatus(
        address user,
        uint256 actionId
    ) external view returns (bool) {
        return userActionStatus[user][actionId];
    }

    function getUserByUsername(
        string memory username
    ) external view returns (address) {
        return usernameToAddress[username];
    }

    function getAllVerifiedUsers() external view returns (address[] memory) {
        return verifiedUsers;
    }

    function getVerifiedUsersCount() external view returns (uint256) {
        return verifiedUsers.length;
    }

    function getActionVerificationCount(
        uint256 actionId
    ) external view returns (uint256) {
        return actionVerificationCounts[actionId];
    }

    // Advanced query functions for UI
    function getUsersWithAction(
        uint256 actionId
    ) external view returns (address[] memory) {
        address[] memory usersWithAction = new address[](verifiedUsers.length);
        uint256 count = 0;

        for (uint256 i = 0; i < verifiedUsers.length; i++) {
            if (userActionStatus[verifiedUsers[i]][actionId]) {
                usersWithAction[count] = verifiedUsers[i];
                count++;
            }
        }

        // Resize array to actual count
        address[] memory result = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = usersWithAction[i];
        }

        return result;
    }

    function getUserActionSummary(
        address user
    )
        external
        view
        returns (
            string memory username,
            uint256 totalActions,
            uint256 lastVerification,
            bool[] memory actionStatuses
        )
    {
        UserData memory user_data = userData[user];

        // Get status for first 10 actions (can be extended)
        actionStatuses = new bool[](10);
        for (uint256 i = 0; i < 10; i++) {
            actionStatuses[i] = userActionStatus[user][i];
        }

        return (
            user_data.username,
            user_data.totalActionsVerified,
            user_data.lastVerificationTimestamp,
            actionStatuses
        );
    }

    function getRecentActivity(
        uint256 limit
    )
        external
        view
        returns (
            address[] memory users,
            uint256[] memory timestamps,
            uint256[] memory actionCounts
        )
    {
        uint256 userCount = verifiedUsers.length;
        uint256 actualLimit = limit > userCount ? userCount : limit;

        users = new address[](actualLimit);
        timestamps = new uint256[](actualLimit);
        actionCounts = new uint256[](actualLimit);

        // Simple implementation - returns most recent users
        // In production, you'd want to sort by timestamp
        for (uint256 i = 0; i < actualLimit; i++) {
            address user = verifiedUsers[userCount - 1 - i];
            users[i] = user;
            timestamps[i] = userData[user].lastVerificationTimestamp;
            actionCounts[i] = userData[user].totalActionsVerified;
        }

        return (users, timestamps, actionCounts);
    }

    // Admin functions
    function deactivateUser(address user) external {
        // In production, add proper access control
        userData[user].isActive = false;
    }

    function reactivateUser(address user) external {
        // In production, add proper access control
        userData[user].isActive = true;
    }
}
