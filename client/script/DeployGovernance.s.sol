// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {Script, console} from "forge-std/Script.sol";
import {Governance} from "../src/Governance.sol";

contract DeployGovernance is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the governance contract
        Governance governance = new Governance();
        console.log("Governance contract deployed at:", address(governance));

        vm.stopBroadcast();
    }
}
