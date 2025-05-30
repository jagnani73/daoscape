// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {Script, console} from "forge-std/Script.sol";
import {DynamicTwitterProver} from "../src/vlayer/DynamicTwitterProver.sol";
import {DynamicTwitterVerifier} from "../src/vlayer/DynamicTwitterVerifier.sol";

contract DeployDynamicTwitter is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the prover contract
        DynamicTwitterProver prover = new DynamicTwitterProver();
        console.log("DynamicTwitterProver deployed at:", address(prover));

        // Deploy the verifier contract with the prover address
        DynamicTwitterVerifier verifier = new DynamicTwitterVerifier(
            address(prover)
        );
        console.log("DynamicTwitterVerifier deployed at:", address(verifier));

        // Log some initial configuration
        console.log("Initial action config count:", prover.actionConfigCount());

        // Get all active actions
        uint256[] memory activeActions = prover.getAllActiveActions();
        console.log("Active actions count:", activeActions.length);

        for (uint256 i = 0; i < activeActions.length; i++) {
            console.log("Active action ID:", activeActions[i]);
        }

        vm.stopBroadcast();
    }
}
