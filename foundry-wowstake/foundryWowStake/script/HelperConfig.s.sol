// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console2} from "forge-std/Script.sol";
import {WowToken} from "../src/WowToken.sol";

contract HelperConfig is Script {
    uint256 public constant INITIAL_SUPPLY = 100 ether; // 1 million tokens with 18 decimal places
    struct NetworkConfig {
        uint256 deployer;
    }
    mapping(uint256 chainId => NetworkConfig) public networkConfigs;

    uint256 public constant ETH_SEPOLIA_CHAIN_ID = 11155111;
    uint256 public constant LOCAL_CHAIN_ID = 31337;

    constructor() {
        networkConfigs[ETH_SEPOLIA_CHAIN_ID] = getSepoliaEthConfig();
        networkConfigs[LOCAL_CHAIN_ID] = getOrCreateAnvilEthConfig();
        // Note: We skip doing the local config
    }

    function getSepoliaEthConfig() public view returns (NetworkConfig memory) {
        return
            NetworkConfig({
                deployer: vm.envUint("PRIVATE_KEY") // ETH / USD
            });
    }

    function getOrCreateAnvilEthConfig()
        public
        view
        returns (NetworkConfig memory)
    {
        return
            NetworkConfig({
                deployer: vm.envUint("ANVIL_PRIVATE_KEY") // ETH / USD
            });
    }

    function getDeployer(uint256 chainid) public view returns (uint256) {
        return networkConfigs[chainid].deployer;
    }
}
