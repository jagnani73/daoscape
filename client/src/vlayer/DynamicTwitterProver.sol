// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Prover} from "vlayer-0.1.0/Prover.sol";
import {Web, WebProof, WebProofLib, WebLib} from "vlayer-0.1.0/WebProof.sol";

contract DynamicTwitterProver is Prover {
    using WebProofLib for WebProof;
    using WebLib for Web;

    // Action types enum
    enum ActionType {
        FOLLOW_USER,
        LIKE_POST,
        RETWEET_POST,
        REPLY_TO_POST,
        QUOTE_TWEET,
        PROFILE_VERIFICATION
    }

    // Struct to define an action configuration
    struct ActionConfig {
        ActionType actionType;
        string baseUrl;
        string jsonPath;
        string expectedValue;
        bool expectedValueIsBool;
        bool isActive;
    }

    // Predefined action configurations
    mapping(uint256 => ActionConfig) public actionConfigs;
    uint256 public actionConfigCount;

    constructor() {
        // Initialize default action configurations
        _initializeDefaultActions();
    }

    function _initializeDefaultActions() internal {
        // Profile verification action
        actionConfigs[0] = ActionConfig({
            actionType: ActionType.PROFILE_VERIFICATION,
            baseUrl: "https://api.x.com/1.1/account/settings.json",
            jsonPath: "screen_name",
            expectedValue: "",
            expectedValueIsBool: false,
            isActive: true
        });

        // Follow user action - checks if user follows a specific account using GraphQL endpoint
        actionConfigs[1] = ActionConfig({
            actionType: ActionType.FOLLOW_USER,
            baseUrl: "https://x.com/i/api/graphql/xWw45l6nX7DP2FKRyePXSw/UserByScreenName",
            jsonPath: "data.user.result.relationship_perspectives.following",
            expectedValue: "true",
            expectedValueIsBool: true,
            isActive: true
        });

        // Like post action - checks if user liked a specific post
        actionConfigs[2] = ActionConfig({
            actionType: ActionType.LIKE_POST,
            baseUrl: "https://x.com/i/api/graphql/u5Tij6ERlSH2LZvCUqallw/TweetDetail",
            jsonPath: "data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.favorited",
            expectedValue: "true",
            expectedValueIsBool: true,
            isActive: true
        });

        // Retweet action - checks if user retweeted a specific post
        actionConfigs[3] = ActionConfig({
            actionType: ActionType.RETWEET_POST,
            baseUrl: "https://x.com/i/api/graphql/u5Tij6ERlSH2LZvCUqallw/TweetDetail",
            jsonPath: "data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.retweeted",
            expectedValue: "true",
            expectedValueIsBool: true,
            isActive: true
        });

        actionConfigCount = 4;
    }

    // Main function to verify any action based on action ID
    function verifyAction(
        WebProof calldata webProof,
        uint256 actionId,
        string memory username,
        string memory targetValue,
        address account
    )
        public
        view
        returns (
            Proof memory,
            bool,
            string memory,
            address,
            uint256,
            string memory,
            string memory
        )
    {
        require(actionId < actionConfigCount, "Invalid action ID");
        require(actionConfigs[actionId].isActive, "Action is not active");

        ActionConfig memory config = actionConfigs[actionId];

        Web memory web = webProof.verifyWithUrlPrefix(config.baseUrl);

        bool actionVerified = false;
        string memory actualValue = "";

        if (config.actionType == ActionType.PROFILE_VERIFICATION) {
            actualValue = web.jsonGetString(config.jsonPath);
            actionVerified =
                keccak256(abi.encodePacked(actualValue)) ==
                keccak256(abi.encodePacked(username));
        } else {
            if (config.expectedValueIsBool) {
                bool actualBoolValue = web.jsonGetBool(config.jsonPath);
                actualValue = actualBoolValue ? "true" : "false";
                actionVerified =
                    actualBoolValue ==
                    (keccak256(abi.encodePacked(config.expectedValue)) ==
                        keccak256(abi.encodePacked("true")));
            } else {
                actualValue = web.jsonGetString(config.jsonPath);
                actionVerified =
                    keccak256(abi.encodePacked(actualValue)) ==
                    keccak256(abi.encodePacked(config.expectedValue));
            }
        }

        return (
            proof(),
            actionVerified,
            actualValue,
            account,
            actionId,
            username,
            targetValue
        );
    }

    // Function to verify multiple actions at once
    function verifyMultipleActions(
        WebProof[] calldata webProofs,
        uint256[] memory actionIds,
        string memory username,
        string[] memory targetValues,
        address account
    )
        public
        view
        returns (
            Proof memory,
            bool[] memory,
            string[] memory,
            address,
            uint256[] memory,
            string memory,
            string[] memory
        )
    {
        require(
            webProofs.length == actionIds.length,
            "Mismatched array lengths"
        );
        require(
            actionIds.length == targetValues.length,
            "Mismatched array lengths"
        );

        bool[] memory results = new bool[](actionIds.length);
        string[] memory actualValues = new string[](actionIds.length);

        for (uint256 i = 0; i < actionIds.length; i++) {
            require(actionIds[i] < actionConfigCount, "Invalid action ID");
            require(
                actionConfigs[actionIds[i]].isActive,
                "Action is not active"
            );

            ActionConfig memory config = actionConfigs[actionIds[i]];

            Web memory web = webProofs[i].verifyWithUrlPrefix(config.baseUrl);

            if (config.actionType == ActionType.PROFILE_VERIFICATION) {
                actualValues[i] = web.jsonGetString(config.jsonPath);
                results[i] =
                    keccak256(abi.encodePacked(actualValues[i])) ==
                    keccak256(abi.encodePacked(username));
            } else {
                if (config.expectedValueIsBool) {
                    bool actualBoolValue = web.jsonGetBool(config.jsonPath);
                    actualValues[i] = actualBoolValue ? "true" : "false";
                    results[i] =
                        actualBoolValue ==
                        (keccak256(abi.encodePacked(config.expectedValue)) ==
                            keccak256(abi.encodePacked("true")));
                } else {
                    actualValues[i] = web.jsonGetString(config.jsonPath);
                    results[i] =
                        keccak256(abi.encodePacked(actualValues[i])) ==
                        keccak256(abi.encodePacked(config.expectedValue));
                }
            }
        }

        return (
            proof(),
            results,
            actualValues,
            account,
            actionIds,
            username,
            targetValues
        );
    }

    // Helper function to build URLs with parameters
    function _buildUrl(
        string memory baseUrl,
        string memory username,
        string memory targetValue
    ) internal pure returns (string memory) {
        // Check if this is a GraphQL endpoint that needs special parameter handling
        if (_contains(baseUrl, "graphql")) {
            // Handle GraphQL endpoints
            if (_contains(baseUrl, "TweetDetail")) {
                // TweetDetail endpoint for likes and retweets
                return _buildTweetDetailUrl(baseUrl, targetValue);
            } else if (_contains(baseUrl, "UserByScreenName")) {
                // UserByScreenName endpoint for follow verification
                return _buildUserByScreenNameUrl(baseUrl, targetValue);
            }
        } else if (_contains(baseUrl, "account/settings.json")) {
            // Profile verification endpoint - no additional parameters needed
            return baseUrl;
        }

        // Default case - return base URL
        return baseUrl;
    }

    // Helper function to build TweetDetail GraphQL URL
    function _buildTweetDetailUrl(
        string memory baseUrl,
        string memory tweetId
    ) internal pure returns (string memory) {
        // Build variables parameter
        string memory variables = string(
            abi.encodePacked(
                '{"focalTweetId":"',
                tweetId,
                '",',
                '"with_rux_injections":false,',
                '"rankingMode":"Relevance",',
                '"includePromotedContent":true,',
                '"withCommunity":true,',
                '"withQuickPromoteEligibilityTweetFields":true,',
                '"withBirdwatchNotes":true,',
                '"withVoice":true}'
            )
        );

        // Build features parameter (simplified version)
        string memory features = string(
            abi.encodePacked(
                '{"rweb_video_screen_enabled":false,',
                '"profile_label_improvements_pcf_label_in_post_enabled":true,',
                '"rweb_tipjar_consumption_enabled":true,',
                '"verified_phone_label_enabled":false,',
                '"creator_subscriptions_tweet_preview_api_enabled":true,',
                '"responsive_web_graphql_timeline_navigation_enabled":true,',
                '"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,',
                '"premium_content_api_read_enabled":false,',
                '"communities_web_enable_tweet_community_results_fetch":true,',
                '"c9s_tweet_anatomy_moderator_badge_enabled":true,',
                '"responsive_web_grok_analyze_button_fetch_trends_enabled":false,',
                '"responsive_web_grok_analyze_post_followups_enabled":true,',
                '"responsive_web_jetfuel_frame":false,',
                '"responsive_web_grok_share_attachment_enabled":true,',
                '"articles_preview_enabled":true,',
                '"responsive_web_edit_tweet_api_enabled":true,',
                '"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,',
                '"view_counts_everywhere_api_enabled":true,',
                '"longform_notetweets_consumption_enabled":true,',
                '"responsive_web_twitter_article_tweet_consumption_enabled":true,',
                '"tweet_awards_web_tipping_enabled":false,',
                '"responsive_web_grok_show_grok_translated_post":false,',
                '"responsive_web_grok_analysis_button_from_backend":true,',
                '"creator_subscriptions_quote_tweet_preview_enabled":false,',
                '"freedom_of_speech_not_reach_fetch_enabled":true,',
                '"standardized_nudges_misinfo":true,',
                '"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,',
                '"longform_notetweets_rich_text_read_enabled":true,',
                '"longform_notetweets_inline_media_enabled":true,',
                '"responsive_web_grok_image_annotation_enabled":true,',
                '"responsive_web_enhance_cards_enabled":false}'
            )
        );

        // Build fieldToggles parameter
        string memory fieldToggles = string(
            abi.encodePacked(
                '{"withArticleRichContentState":true,',
                '"withArticlePlainText":false,',
                '"withGrokAnalyze":false,',
                '"withDisallowedReplyControls":false}'
            )
        );

        // Construct the full URL
        return
            string(
                abi.encodePacked(
                    baseUrl,
                    "?variables=",
                    _urlEncode(variables),
                    "&features=",
                    _urlEncode(features),
                    "&fieldToggles=",
                    _urlEncode(fieldToggles)
                )
            );
    }

    // Helper function to build UserByScreenName GraphQL URL
    function _buildUserByScreenNameUrl(
        string memory baseUrl,
        string memory targetValue
    ) internal pure returns (string memory) {
        string memory variables = string(
            abi.encodePacked('{"screen_name":"', targetValue, '"}')
        );

        string memory features = string(
            abi.encodePacked(
                '{"hidden_profile_subscriptions_enabled":true,',
                '"profile_label_improvements_pcf_label_in_post_enabled":true,',
                '"rweb_tipjar_consumption_enabled":true,',
                '"verified_phone_label_enabled":false,',
                '"subscriptions_verification_info_is_identity_verified_enabled":true,',
                '"subscriptions_verification_info_verified_since_enabled":true,',
                '"highlights_tweets_tab_ui_enabled":true,',
                '"responsive_web_twitter_article_notes_tab_enabled":true,',
                '"subscriptions_feature_can_gift_premium":true,',
                '"creator_subscriptions_tweet_preview_api_enabled":true,',
                '"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,',
                '"responsive_web_graphql_timeline_navigation_enabled":true}'
            )
        );

        string memory fieldToggles = string(
            abi.encodePacked('{"withAuxiliaryUserLabels":true}')
        );

        return
            string(
                abi.encodePacked(
                    baseUrl,
                    "?variables=",
                    _urlEncode(variables),
                    "&features=",
                    _urlEncode(features),
                    "&fieldToggles=",
                    _urlEncode(fieldToggles)
                )
            );
    }

    // Helper function to check if a string contains a substring
    function _contains(
        string memory str,
        string memory substr
    ) internal pure returns (bool) {
        bytes memory strBytes = bytes(str);
        bytes memory substrBytes = bytes(substr);

        if (substrBytes.length > strBytes.length) {
            return false;
        }

        for (uint i = 0; i <= strBytes.length - substrBytes.length; i++) {
            bool found = true;
            for (uint j = 0; j < substrBytes.length; j++) {
                if (strBytes[i + j] != substrBytes[j]) {
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

    // Simple URL encoding for JSON strings (basic implementation)
    function _urlEncode(
        string memory str
    ) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory encoded = new bytes(strBytes.length * 3); // Worst case scenario
        uint encodedLength = 0;

        for (uint i = 0; i < strBytes.length; i++) {
            bytes1 char = strBytes[i];

            if (
                (char >= 0x30 && char <= 0x39) || // 0-9
                (char >= 0x41 && char <= 0x5A) || // A-Z
                (char >= 0x61 && char <= 0x7A) || // a-z
                char == 0x2D ||
                char == 0x2E ||
                char == 0x5F ||
                char == 0x7E
            ) {
                // -._~
                encoded[encodedLength] = char;
                encodedLength++;
            } else {
                // URL encode the character
                encoded[encodedLength] = 0x25; // %
                encoded[encodedLength + 1] = _toHexChar(uint8(char) / 16);
                encoded[encodedLength + 2] = _toHexChar(uint8(char) % 16);
                encodedLength += 3;
            }
        }

        // Create a new bytes array with the correct length
        bytes memory result = new bytes(encodedLength);
        for (uint i = 0; i < encodedLength; i++) {
            result[i] = encoded[i];
        }

        return string(result);
    }

    // Helper function to convert a number to hex character
    function _toHexChar(uint8 value) internal pure returns (bytes1) {
        if (value < 10) {
            return bytes1(uint8(0x30 + value)); // 0-9
        } else {
            return bytes1(uint8(0x41 + value - 10)); // A-F
        }
    }

    // Admin functions to manage action configurations
    function addActionConfig(
        ActionType actionType,
        string memory baseUrl,
        string memory jsonPath,
        string memory expectedValue,
        bool expectedValueIsBool
    ) external returns (uint256) {
        uint256 newActionId = actionConfigCount;
        actionConfigs[newActionId] = ActionConfig({
            actionType: actionType,
            baseUrl: baseUrl,
            jsonPath: jsonPath,
            expectedValue: expectedValue,
            expectedValueIsBool: expectedValueIsBool,
            isActive: true
        });
        actionConfigCount++;
        return newActionId;
    }

    function updateActionConfig(
        uint256 actionId,
        string memory baseUrl,
        string memory jsonPath,
        string memory expectedValue,
        bool expectedValueIsBool,
        bool isActive
    ) external {
        require(actionId < actionConfigCount, "Invalid action ID");
        ActionConfig storage config = actionConfigs[actionId];
        config.baseUrl = baseUrl;
        config.jsonPath = jsonPath;
        config.expectedValue = expectedValue;
        config.expectedValueIsBool = expectedValueIsBool;
        config.isActive = isActive;
    }

    function toggleActionConfig(uint256 actionId) external {
        require(actionId < actionConfigCount, "Invalid action ID");
        actionConfigs[actionId].isActive = !actionConfigs[actionId].isActive;
    }

    // View functions
    function getActionConfig(
        uint256 actionId
    ) external view returns (ActionConfig memory) {
        require(actionId < actionConfigCount, "Invalid action ID");
        return actionConfigs[actionId];
    }

    function getAllActiveActions() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < actionConfigCount; i++) {
            if (actionConfigs[i].isActive) {
                activeCount++;
            }
        }

        uint256[] memory activeActions = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < actionConfigCount; i++) {
            if (actionConfigs[i].isActive) {
                activeActions[index] = i;
                index++;
            }
        }

        return activeActions;
    }
}
