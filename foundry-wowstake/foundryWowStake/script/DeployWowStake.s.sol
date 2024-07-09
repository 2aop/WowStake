// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import {Script, console2} from "forge-std/Script.sol";
import {WowStake} from "../src/WowStake.sol";
import {WowToken} from "../src/WowToken.sol";
import {EthToken} from "../src/EthToken.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeployWowStake is Script {
    uint256 public constant INITIAL_SUPPLY = 1639344262295081960 ether;

    function run() external returns (WowStake, EthToken, WowToken) {
        HelperConfig helperConfig = new HelperConfig();
        uint256 deployerKey = helperConfig.getDeployer(block.chainid);
        vm.startBroadcast(deployerKey);
        WowToken wowToken = new WowToken(INITIAL_SUPPLY);
        EthToken ethToken = new EthToken(INITIAL_SUPPLY); //for test

        WowStake wowStake = new WowStake();

        wowStake.initialize(address(0x0), address(wowToken), 1 ether);
        wowToken.mint(address(wowStake), INITIAL_SUPPLY);

        vm.stopBroadcast();
        return (wowStake, ethToken, wowToken);
    }
}
