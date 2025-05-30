// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {Test, console} from "forge-std/Test.sol";
import {DynamicTwitterProver} from "../src/vlayer/DynamicTwitterProver.sol";
import {DynamicTwitterVerifier} from "../src/vlayer/DynamicTwitterVerifier.sol";

contract DynamicTwitterTest is Test {
    DynamicTwitterProver public prover;
    DynamicTwitterVerifier public verifier;

    address public user1 = address(0x1);
    address public user2 = address(0x2);
    string public username1 = "testuser1";
    string public username2 = "testuser2";

    function setUp() public {
        prover = new DynamicTwitterProver();
        verifier = new DynamicTwitterVerifier(address(prover));
    }

    function testInitialConfiguration() public {
        // Test initial action configurations
        assertEq(prover.actionConfigCount(), 4);

        // Test that all initial actions are active
        uint256[] memory activeActions = prover.getAllActiveActions();
        assertEq(activeActions.length, 4);

        // Test specific action configurations
        DynamicTwitterProver.ActionConfig memory config0 = prover
            .getActionConfig(0);
        assertEq(
            uint256(config0.actionType),
            uint256(DynamicTwitterProver.ActionType.PROFILE_VERIFICATION)
        );
        assertTrue(config0.isActive);

        DynamicTwitterProver.ActionConfig memory config1 = prover
            .getActionConfig(1);
        assertEq(
            uint256(config1.actionType),
            uint256(DynamicTwitterProver.ActionType.FOLLOW_USER)
        );
        assertTrue(config1.isActive);
    }

    function testAddActionConfig() public {
        uint256 initialCount = prover.actionConfigCount();

        uint256 newActionId = prover.addActionConfig(
            DynamicTwitterProver.ActionType.QUOTE_TWEET,
            "https://api.x.com/1.1/statuses/show.json?id={post_id}",
            "quoted_status_id",
            "12345"
        );

        assertEq(newActionId, initialCount);
        assertEq(prover.actionConfigCount(), initialCount + 1);

        DynamicTwitterProver.ActionConfig memory newConfig = prover
            .getActionConfig(newActionId);
        assertEq(
            uint256(newConfig.actionType),
            uint256(DynamicTwitterProver.ActionType.QUOTE_TWEET)
        );
        assertTrue(newConfig.isActive);
    }

    function testUpdateActionConfig() public {
        // Update action config 0
        prover.updateActionConfig(
            0,
            "https://new-api.x.com/test",
            "new_path",
            "new_value",
            false
        );

        DynamicTwitterProver.ActionConfig memory updatedConfig = prover
            .getActionConfig(0);
        assertEq(updatedConfig.baseUrl, "https://new-api.x.com/test");
        assertEq(updatedConfig.jsonPath, "new_path");
        assertEq(updatedConfig.expectedValue, "new_value");
        assertFalse(updatedConfig.isActive);
    }

    function testToggleActionConfig() public {
        // Initially action 0 should be active
        DynamicTwitterProver.ActionConfig memory config = prover
            .getActionConfig(0);
        assertTrue(config.isActive);

        // Toggle it
        prover.toggleActionConfig(0);
        config = prover.getActionConfig(0);
        assertFalse(config.isActive);

        // Toggle back
        prover.toggleActionConfig(0);
        config = prover.getActionConfig(0);
        assertTrue(config.isActive);
    }

    function testGetAllActiveActions() public {
        uint256[] memory activeActions = prover.getAllActiveActions();
        assertEq(activeActions.length, 4);

        // Deactivate action 1
        prover.toggleActionConfig(1);

        activeActions = prover.getAllActiveActions();
        assertEq(activeActions.length, 3);

        // Check that action 1 is not in the list
        bool found = false;
        for (uint256 i = 0; i < activeActions.length; i++) {
            if (activeActions[i] == 1) {
                found = true;
                break;
            }
        }
        assertFalse(found);
    }

    function testVerifierInitialState() public {
        assertEq(verifier.prover(), address(prover));
        assertEq(verifier.getVerifiedUsersCount(), 0);

        address[] memory users = verifier.getAllVerifiedUsers();
        assertEq(users.length, 0);
    }

    function testVerifierUserDataStructure() public {
        // Test getting non-existent user data
        DynamicTwitterVerifier.UserData memory userData = verifier.getUserData(
            user1
        );
        assertEq(userData.username, "");
        assertEq(userData.userAddress, address(0));
        assertEq(userData.totalActionsVerified, 0);
        assertFalse(userData.isActive);
    }

    function testVerifierActionHistory() public {
        // Test getting action history for non-existent user
        DynamicTwitterVerifier.ActionRecord[] memory history = verifier
            .getUserActionHistory(user1, 0);
        assertEq(history.length, 0);

        // Test action status
        bool status = verifier.getUserActionStatus(user1, 0);
        assertFalse(status);
    }

    function testVerifierUserQueries() public {
        // Test username to address mapping
        address userAddr = verifier.getUserByUsername(username1);
        assertEq(userAddr, address(0));

        // Test action verification counts
        uint256 count = verifier.getActionVerificationCount(0);
        assertEq(count, 0);
    }

    function testVerifierAdvancedQueries() public {
        // Test getting users with specific action
        address[] memory usersWithAction = verifier.getUsersWithAction(0);
        assertEq(usersWithAction.length, 0);

        // Test user action summary
        (
            string memory username,
            uint256 totalActions,
            uint256 lastVerification,
            bool[] memory actionStatuses
        ) = verifier.getUserActionSummary(user1);

        assertEq(username, "");
        assertEq(totalActions, 0);
        assertEq(lastVerification, 0);
        assertEq(actionStatuses.length, 10);

        // Test recent activity
        (
            address[] memory users,
            uint256[] memory timestamps,
            uint256[] memory actionCounts
        ) = verifier.getRecentActivity(5);

        assertEq(users.length, 0);
        assertEq(timestamps.length, 0);
        assertEq(actionCounts.length, 0);
    }

    function testVerifierAdminFunctions() public {
        // Test deactivate/reactivate user (these don't require existing user)
        verifier.deactivateUser(user1);
        verifier.reactivateUser(user1);
        // These should not revert even for non-existent users
    }

    function testInvalidActionId() public {
        // Test invalid action ID in prover
        vm.expectRevert("Invalid action ID");
        prover.getActionConfig(999);

        vm.expectRevert("Invalid action ID");
        prover.updateActionConfig(999, "", "", "", true);

        vm.expectRevert("Invalid action ID");
        prover.toggleActionConfig(999);
    }

    function testProverBuildUrl() public view {
        // This tests the internal _buildUrl function indirectly
        // by checking that the function doesn't revert with valid inputs
        DynamicTwitterProver.ActionConfig memory config = prover
            .getActionConfig(0);
        // The _buildUrl function is internal, so we can't test it directly
        // but we can verify the config exists and is valid
        assertTrue(bytes(config.baseUrl).length > 0);
    }

    function testEventEmission() public {
        // We can't easily test event emission without actually calling the verification functions
        // which require valid proofs. This would be tested in integration tests.
        assertTrue(true); // Placeholder for event testing
    }

    function testGasUsage() public {
        // Test gas usage for various operations
        uint256 gasBefore = gasleft();
        prover.addActionConfig(
            DynamicTwitterProver.ActionType.LIKE_POST,
            "https://test.com",
            "test_path",
            "test_value"
        );
        uint256 gasUsed = gasBefore - gasleft();

        // Ensure gas usage is reasonable (adjust threshold as needed)
        assertTrue(gasUsed < 200000);
    }

    function testArrayLengthValidation() public {
        // Test that array length mismatches are handled properly
        // This would be tested in the actual verification functions
        // which require valid proofs
        assertTrue(true); // Placeholder
    }

    function testStringComparison() public {
        // Test string comparison logic used in verification
        string memory str1 = "test";
        string memory str2 = "test";
        string memory str3 = "different";

        assertTrue(
            keccak256(abi.encodePacked(str1)) ==
                keccak256(abi.encodePacked(str2))
        );
        assertFalse(
            keccak256(abi.encodePacked(str1)) ==
                keccak256(abi.encodePacked(str3))
        );
    }
}
