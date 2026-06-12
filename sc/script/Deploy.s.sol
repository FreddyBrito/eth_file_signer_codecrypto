// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/DocumentRegistry.sol";

contract DeployScript is Script {
    function run() external returns (DocumentRegistry) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        DocumentRegistry registry = new DocumentRegistry();

        vm.stopBroadcast();

        console.log("DocumentRegistry deployed at:", address(registry));
        return registry;
    }
}
