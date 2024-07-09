// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;
import {Test, console} from "forge-std/Test.sol";
import {WowStake} from "../src/WowStake.sol";
import {EthToken} from "../src/EthToken.sol";
import {WowToken} from "../src/WowToken.sol";

import {DeployWowStake} from "../script/DeployWowStake.s.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract WowStakeTest is Test {
    WowStake public wowStake;
    EthToken public ethToken;
    WowToken public wowToken;
    DeployWowStake public deploy;

    address public constant USER = address(1);
    uint256 public constant STARTING_USER_BALANCE = 20 ether;
    uint256 public constant STARTING_USER_ALLOWANCE_BALANCE =
        1639344262295081960000 ether;

    uint256 public constant SEND_VALUE = 10 ether; // just a value to make sure we are sending enough!

    function setUp() public {
        vm.roll(10);

        deploy = new DeployWowStake();
        (wowStake, ethToken, wowToken) = deploy.run();
        console.log(address(wowStake));

        vm.startPrank(USER);
        vm.deal(USER, STARTING_USER_ALLOWANCE_BALANCE);

        wowStake.stake{value: SEND_VALUE}(0);

        vm.stopPrank();
        vm.startPrank(address(wowStake));

        vm.stopPrank();
    }

    function testGetAllPool() public {
        console.log(wowStake.getRewardTokenPerBlock());
        assertEq(wowStake.getAllPoolDetail().length, 3);
    }

    ////////////////////////
    ////test stake ////////
    ////////////////////////
    function testStakePoolNotExist() public {
        vm.expectRevert();
        wowStake.stake{value: SEND_VALUE}(100);
    }

    function testStakeValueNotGreaterThan0() public {
        vm.expectRevert();
        wowStake.stake{value: 0}(2);
    }

    function testStakeValueLesszThanMinDepoistAmount() public {
        uint256 testValue = wowStake.getPoolDetail(0).minDepositAmount / 2;
        console.log(testValue);
        vm.expectRevert();
        wowStake.stake{value: testValue}(0);
    }

    function testStakeCreateOrderSuccess() public {
        vm.startPrank(USER);
        vm.roll(10);
        // ethToken.approve(address(wowStake), STARTING_USER_ALLOWANCE_BALANCE);
        wowStake.stake{value: SEND_VALUE}(0);
        assertEq(wowStake.getUserStakeOrder(0, 0).stakeAmount, SEND_VALUE);
        vm.stopPrank();
    }

    function testStakeSuccessThenPoolStakeAmountEqValue() public {}

    function testStakeSuccessThenTransferSuccess() public {
        vm.startPrank(USER);
        vm.deal(USER, STARTING_USER_ALLOWANCE_BALANCE);
        wowStake.stake{value: SEND_VALUE}(0);
        assertEq(wowStake.balance(), 2 * SEND_VALUE);
        vm.stopPrank();
    }

    function testGetRewardsByOrderRewardCalculateCorrect() public {
        vm.startPrank(USER);
        vm.roll(20);
        uint256 rewardPerBlock = wowStake.getRewardTokenPerBlock();
        uint256 poolWeight = wowStake.getPoolDetail(0).poolWeight;
        wowStake.getRewardByOrder(0, 0);
        uint256 reward = ((((20 - 10) * rewardPerBlock * poolWeight) /
            wowStake.getTotalPoolWeight()) * SEND_VALUE) /
            wowStake.getPoolDetail(0).stTokenAmount;

        assertEq(wowStake.getUserTotalRewardByPool(0), reward);

        vm.stopPrank();
    }

    function testGetRewardsByOrderRewardOrderStatusUpdated() public {
        vm.startPrank(USER);
        vm.roll(20);
        uint256 rewardPerBlock = wowStake.getRewardTokenPerBlock();
        uint256 poolWeight = wowStake.getPoolDetail(0).poolWeight;
        wowStake.getRewardByOrder(0, 0);

        assertEq(wowStake.getUserStakeOrder(0, 0).lastRewardBlock, 20);

        vm.stopPrank();
    }

    function testGetRewardsByPoolRewardCalculateCorrect() public {
        vm.startPrank(USER);
        vm.roll(20);
        uint256 rewardPerBlock = wowStake.getRewardTokenPerBlock();
        uint256 poolWeight = wowStake.getPoolDetail(0).poolWeight;
        wowStake.getRewardsByPool(0);
        uint256 reward = ((((20 - 10) * rewardPerBlock * poolWeight) /
            wowStake.getTotalPoolWeight()) * SEND_VALUE) /
            wowStake.getPoolDetail(0).stTokenAmount;

        assertEq(wowStake.getUserTotalRewardByPool(0), reward);

        vm.stopPrank();
    }

    function testGetRewardsByPoolStatusUpdated() public {
        vm.startPrank(USER);
        vm.roll(20);
        uint256 rewardPerBlock = wowStake.getRewardTokenPerBlock();
        uint256 poolWeight = wowStake.getPoolDetail(0).poolWeight;
        wowStake.getRewardsByPool(0);

        assertEq(wowStake.getUserStakeOrder(0, 0).lastRewardBlock, 20);

        vm.stopPrank();
    }

    function testUnstakeByOrderPoolNotExist() public {
        vm.startPrank(USER);

        vm.expectRevert();
        wowStake.unstakeByOrder(3, 0);
    }

    function testUnstakeByOrderNotExceedLimitTime() public {
        vm.startPrank(USER);
        vm.roll(11);
        console.log(wowStake.getUserStakeOrder(0, 0).stakeBlock);
        vm.expectRevert();
        console.log("11");
        wowStake.unstakeByOrder(0, 0);
        vm.stopPrank();
    }

    function testUnstakeByPoolPoolNotExist() public {
        vm.startPrank(USER);
        vm.expectRevert();
        wowStake.unstakeByPool(3);
        vm.stopPrank();
    }

    function testUstakeByOrderSuccessAndOrderUpdated() public {
        vm.startPrank(USER);
        vm.roll(20);
        console.log(wowStake.getPoolDetail(0).stTokenAmount);
        wowStake.unstakeByOrder(0, 0);
        console.log(wowStake.getPoolDetail(0).stTokenAmount);

        assertEq(wowStake.getUserStakeOrder(0, 0).lastRewardBlock, 20);
        assertEq(wowStake.getUserStakeOrder(0, 0).valid, false);

        vm.stopPrank();
    }

    function testUstakeByPoolSuccessAndOnlyCalculateValidOrder() public {
        vm.startPrank(USER);
        console.log(wowStake.getUserStakeOrders(0).length);
        vm.roll(20);
        wowStake.stake{value: SEND_VALUE}(0);
        console.log(wowStake.getUserStakeOrders(0).length);
        wowStake.getUserStakeOrders(0);

        vm.roll(30);
        wowStake.getUserStakeOrders(0);

        wowStake.unstakeByPool(0);
        console.log("rewwwwwwwwwww");
        console.log(
            wowStake.getUserTotalRewardByPool(
                wowStake.getAllPoolDetail().length - 1
            )
        );
        uint256 firstReward = wowStake.getUserTotalRewardByPool(0);

        wowStake.stake{value: SEND_VALUE}(0);

        vm.roll(40);
        wowStake.getUserStakeOrders(0);

        wowStake.stake{value: SEND_VALUE}(0);
        wowStake.getUserStakeOrders(0);

        wowStake.unstakeByPool(0);
        uint256 secondReward = wowStake.getUserTotalRewardByPool(0) -
            firstReward;
        wowStake.stake{value: SEND_VALUE}(0);

        vm.roll(50);
        wowStake.getUserStakeOrders(0);

        wowStake.unstakeByPool(0);
        uint256 thirdReward = wowStake.getUserTotalRewardByPool(0) -
            secondReward -
            firstReward;
        assertEq(secondReward, thirdReward);
        vm.stopPrank();
    }

    function testGetUserReward() public {
        vm.startPrank(USER);
        console.log("testGetUserReward");
        assertGe(wowStake.getUserReward(), 0);
        vm.stopPrank();
    }

    function testGetAllPoolDetail() public {
        assertEq(wowStake.getAllPoolDetail().length, 3);
    }

    function testAddPool() public {
        vm.startPrank(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);
        wowStake.addPool(11, 11, address(ethToken));
        assertEq(wowStake.getPoolDetail(3).poolWeight, 11);
        vm.stopPrank();
    }

    function testAddPoolAndStake() public {
        vm.startPrank(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);
        wowStake.addPool(11, 11, address(ethToken));
        vm.stopPrank();
        vm.startPrank(USER);
        vm.deal(USER, STARTING_USER_ALLOWANCE_BALANCE);
        ethToken.mint(USER, SEND_VALUE);
        ethToken.approve(address(wowStake), SEND_VALUE);
        wowStake.stake{value: SEND_VALUE}(
            wowStake.getAllPoolDetail().length - 1
        );
        assertEq(
            wowStake
                .getPoolDetail(wowStake.getAllPoolDetail().length - 1)
                .stTokenAmount,
            SEND_VALUE
        );
        vm.stopPrank();
    }

    function testAddPoolAndStakeThenGetRewards() public {
        vm.startPrank(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);
        wowStake.addPool(11, 11, address(ethToken));
        vm.stopPrank();
        vm.startPrank(USER);
        vm.deal(USER, STARTING_USER_ALLOWANCE_BALANCE);
        vm.roll(10);

        ethToken.mint(USER, SEND_VALUE);
        ethToken.approve(address(wowStake), SEND_VALUE);
        wowStake.stake{value: SEND_VALUE}(
            wowStake.getAllPoolDetail().length - 1
        );

        vm.roll(20);
        wowStake.getRewardByOrder(wowStake.getAllPoolDetail().length - 1, 0);
        wowStake.getUserTotalRewardByPool(
            wowStake.getAllPoolDetail().length - 1
        );
        console.log("rewwwwwwwwwww");
        console.log(
            wowStake.getUserTotalRewardByPool(
                wowStake.getAllPoolDetail().length - 1
            )
        );
        assertGt(
            wowStake.getUserTotalRewardByPool(
                wowStake.getAllPoolDetail().length - 1
            ),
            0
        );
        vm.stopPrank();
    }

    function testUpdatePoolWeigth() public {
        vm.startPrank(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);
        wowStake.updateStateStatus(false);
        wowStake.updatePoolWeigth(2, 22);
        assertEq(wowStake.getPoolDetail(2).poolWeight, 22);
        vm.stopPrank();
    }

    function testtest() public {
        console.log(wowStake.test());
    }
}
