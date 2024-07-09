// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {console} from "forge-std/Test.sol";

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {ABDKMath64x64} from "@abdk/ABDKMath64x64.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract WowStake is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    ///////////////////
    // Errors
    ///////////////////

    ///////////////////
    // Types
    ///////////////////
    using SafeERC20 for IERC20;
    using Address for address;
    using ABDKMath64x64 for uint256;

    //@dev stake pool
    struct Pool {
        //@dev address of stake token
        address stTokenAddress;
        //@dev weight of pool
        uint256 poolWeight;
        //@dev the quantity of reward tokens corresponding to each staked token
        uint256 accWowPerST;
        //@dev the total amount of stake token of the pool
        uint256 stTokenAmount;
        //@dev the total remain reward amount of the pool
        uint256 remainRewardAmount;
        //@dev minimum staking amount accepted by this staking pool
        uint256 minDepositAmount;
        //@dev the limit blocks for unstake
        uint256 unstakeLockedBlocks;
    }

    struct StakeOrder {
        //@dev address of stake user
        address userAddress;
        //@dev id of staked pool
        uint256 poolId;
        //@dev amount of staken token
        uint256 stakeAmount;
        //@dev the block of stake
        uint256 stakeBlock;
        // @dev the last block receive rewards
        uint256 lastRewardBlock;
        //@dev the current accumulated reward amount
        //@notice ：System needs to automatically calculate every minute, with upgrades to follow
        uint256 remainRewardValue;
        //@dev false for user had already unstaked
        bool valid;
    }

    ///////////////////
    // State Variables
    ///////////////////
    //@dev the list of stake pool
    Pool[] private s_stakePoolList;
    //@dev the total weight of all pool
    uint256 private s_totalPoolWeight;
    //@dev the amount of rewadr token for each generated block
    uint256 private rewardTokenPerBlock;
    //@dev fee
    uint256 private fee;

    //@dev the address of stake token default ETH
    address private s_stakeToken;
    //@dev the address of reward token default WOW
    address private s_rewardToken;

    bytes32 public constant ADMIN_ROLE = keccak256("admin_role");

    bool private isOpen;

    //@dev mapping of user address to pool id  by stake amount
    mapping(address => mapping(uint256 => uint256)) userStakeAmount;
    //@dev mapping of user address to pool id by all the user stake order
    mapping(address => mapping(uint256 => StakeOrder[])) stakeOrderListIndex;
    //@dev mapping of user  to pool id by rewards amount
    mapping(address => mapping(uint256 => uint256)) userRewardAmount;

    ///////////////////
    // Events
    ///////////////////
    event WowStake_Stake(
        address user,
        uint256 amount,
        uint256 pid,
        uint256 orderId
    );
    event WowStake_UnStakeByPool(address user, uint256 amount, uint256 pid);
    event WowStake_UnStakeByOrder(
        address user,
        uint256 amount,
        uint256 pid,
        uint256 orderId
    );
    event WowStake_GetRewardsOfUnstakeByPool(
        address user,
        uint256 amount,
        uint256 pid
    );
    event WowStake_GetRewardsOfUnstakeByOrder(
        address user,
        uint256 amount,
        uint256 pid,
        uint256 orderId
    );
    event WowStake_GetRewardsByPool(address user, uint256 amount, uint256 pid);
    event WowStake_GetRewardsByOrder(
        address user,
        uint256 amount,
        uint256 pid,
        uint256 order
    );
    event WowStake_AddPool(
        uint256 poolWeight,
        uint256 minDepositAmountin,
        uint256 pid
    );
    event WowStake_UpdatPool(
        address admin,
        uint256 pid,
        uint256 oldWeight,
        uint256 newWeight
    );

    ///////////////////
    // Modifiers
    ///////////////////
    /**
     *
     * @param pid id of pool
     * @notice check whether pool exist
     */
    modifier poolExist(uint256 pid) {
        require(pid <= s_stakePoolList.length, "stake pool not exist");
        _;
    }

    modifier hadStakedForThePool(uint256 pid) {
        require(
            userStakeAmount[msg.sender][pid] > 0,
            "you never staked this pool"
        );
        _;
    }

    modifier isOpenCheck() {
        require(isOpen, "stake not open");
        _;
    }

    ///////////////////
    // Functions
    ///////////////////

    function initialize(
        address _stakeTokenAddress,
        address _rewardTokenAddress,
        uint256 _rewardTokenPerBlock
    ) public initializer {
        s_stakeToken = _stakeTokenAddress;
        s_rewardToken = _rewardTokenAddress;
        __AccessControl_init();
        initPools(s_stakeToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        grantRole(ADMIN_ROLE, msg.sender);
        isOpen = true;
        rewardTokenPerBlock = _rewardTokenPerBlock;
        console.log("init msgsender");
        console.log(msg.sender);
    }

    ///////////////////
    // External Functions
    ///////////////////

    /**
     *
     * @param pid id of pool
     * @notice this function is for user stake their token
     */
    function stake(uint256 pid) external payable poolExist(pid) {
        //Checks
        require(msg.value > 0, "stake amount must greater than 0");
        Pool memory pool = s_stakePoolList[pid];
        require(msg.value >= pool.minDepositAmount, "you need pay more token");

        //Effects
        /**
         * 1 : create order
         * 2 : record user amount of the pool
         * 3 : update pool info
         */
        uint256 orderId = _createOrder(pid);

        userStakeAmount[msg.sender][pid] = msg.value;

        _increasePoolStakeAmount(pid);

        emit WowStake_Stake(msg.sender, msg.value, pid, orderId);

        //Interactions
        _deposit(pool);
    }

    /**
     *
     * @param pid id of pool
     * @notice this function is for user unstake their token by pool if valid
     */
    function unstakeByPool(
        uint256 pid
    ) external isOpenCheck poolExist(pid) hadStakedForThePool(pid) {
        //Checks
        /**
         * 0 : check is open
         * 1 : pool must exist
         * 2 : must staked for the pool
         */

        //Effects
        /**
         * 1 : calculate every valid order rewards(exceeded the unstake time limit)
         * 2 : delelte the record of the user staked for the pool
         * 3 : update stake ordet status
         * 4 : update userRewardAmount
         * 5 : update pool info
         * 6 : emit event
         */
        Pool memory pool = s_stakePoolList[pid];
        (
            uint256 rewardAmount,
            uint256 calculatedStakeAmount
        ) = calculateRewardByPool(pid, true);

        delete userStakeAmount[msg.sender][pid];

        //update unstake valid stakeorder status = false
        _updateStakeOrderStatusByPool(pid, true);

        userRewardAmount[msg.sender][pid] += rewardAmount;

        _decreasePoolStakeAmount(pid, calculatedStakeAmount);

        emit WowStake_GetRewardsOfUnstakeByPool(msg.sender, rewardAmount, pid);
        emit WowStake_UnStakeByPool(msg.sender, calculatedStakeAmount, pid);

        //Interactions
        //transfer reward;
        _transferRewards(rewardAmount);

        //transfer stake money
        _transferStakeToken(pool, calculatedStakeAmount);
    }

    /**
     *
     * @param pid the id of the pool
     * @param orderId the id of the order
     * @notice this function will unstake thier token by order if valid
     */
    function unstakeByOrder(
        uint256 pid,
        uint256 orderId
    ) external isOpenCheck poolExist(pid) {
        //Checks
        /**
         * 0 : checkl is open
         * 1: pool must exist
         * 2: order must exist
         * 3: must excced the unstake limit
         */
        StakeOrder[] memory userStakeOrderList = getUserStakeOrders(pid);
        require(orderId < userStakeOrderList.length, "ordet not exist");

        Pool memory pool = getPoolDetail(pid);
        StakeOrder memory stakeOrder = userStakeOrderList[orderId];
        require(
            block.number - stakeOrder.stakeBlock > pool.unstakeLockedBlocks,
            "order not exceed the lock time"
        );
        require(stakeOrder.valid, "order not valid");

        //Effects
        /**
         * 1 : calculate order rewards
         * 2 : update order status
         * 3 : update the record of the user staked for the pool
         * 4 : update userRewardAmount
         * 5 : update pool info
         * 6 : emit event
         */

        uint256 orderRewards = _calculationRewardByOrder(pid, orderId);

        _updateStakeOrderStatusByOrder(pid, orderId, true);

        userStakeAmount[msg.sender][pid] -= stakeOrder.stakeAmount;

        userRewardAmount[msg.sender][pid] += orderRewards;

        _decreasePoolStakeAmount(pid, stakeOrder.stakeAmount);

        emit WowStake_UnStakeByOrder(
            msg.sender,
            stakeOrder.stakeAmount,
            pid,
            orderId
        );
        emit WowStake_GetRewardsOfUnstakeByOrder(
            msg.sender,
            orderRewards,
            pid,
            orderId
        );

        //Interactions
        //transfer reward
        _transferRewards(orderRewards);
        //transfer stake money
        _transferStakeToken(pool, stakeOrder.stakeAmount);
    }

    /**
     *
     * @param pid  the id of the pool
     * @notice this function will send user rewards of all orders for the pool
     */
    function getRewardsByPool(
        uint256 pid
    ) external isOpenCheck poolExist(pid) hadStakedForThePool(pid) {
        //Checks
        /**
         * 0 : check is open
         * 1 : pool must exist
         * 2 : must staked for the pool
         */

        //Effects
        /**
         * 1 : calculate rewards for this pool
         * 2 : update stake order info
         * 3 : update userRewardAmount
         * 4 : emit event
         */
        Pool memory pool = s_stakePoolList[pid];
        (
            uint256 rewardAmount,
            uint256 calculatedStakeAmount
        ) = calculateRewardByPool(pid, false);

        _updateStakeOrderStatusByPool(pid, false);

        userRewardAmount[msg.sender][pid] += rewardAmount;

        emit WowStake_GetRewardsByPool(msg.sender, rewardAmount, pid);

        //Interactions
        //transfer reward;
        _transferRewards(rewardAmount);
    }

    /**
     *
     * @param pid the id of the pool
     * @param orderId the id the order
     * @notice the function will send user rewards of the order
     */
    function getRewardByOrder(
        uint256 pid,
        uint256 orderId
    ) external isOpenCheck poolExist(pid) {
        //Checks
        /**
         * 0 : check is open
         * 1 : pool must exist
         * 2 : order must exist
         */
        StakeOrder[] memory userStakeOrderList = getUserStakeOrders(pid);
        require(orderId < userStakeOrderList.length, "ordet not exist");

        //Effects
        /**
         * 1 : calculate order rewards
         * 2 : update order info
         * 3 : update userRewardAmount
         * 4 : emit event
         */

        uint256 orderRewards = _calculationRewardByOrder(pid, orderId);

        _updateStakeOrderStatusByOrder(pid, orderId, false);

        userRewardAmount[msg.sender][pid] += orderRewards;
        emit WowStake_GetRewardsByOrder(msg.sender, orderRewards, pid, orderId);

        //Interactions
        //transfer reward;
        _transferRewards(orderRewards);
    }

    ///////////////////
    // Public Functions
    ///////////////////

    /**
     *
     * @param _poolWeight  the weight of the pool
     * @param _minDepositAmount  the min deposit amount of the pool
     */
    function addPool(
        uint256 _poolWeight,
        uint256 _minDepositAmount,
        address _tokenAdress
    ) public onlyRole(ADMIN_ROLE) isOpenCheck {
        require(_tokenAdress != address(0x0), "address can not be 0x0");

        {
            s_stakePoolList.push(
                Pool({
                    stTokenAddress: _tokenAdress,
                    poolWeight: _poolWeight,
                    accWowPerST: 0,
                    stTokenAmount: 0,
                    remainRewardAmount: 0,
                    minDepositAmount: _minDepositAmount,
                    unstakeLockedBlocks: 2
                })
            );

            s_totalPoolWeight += _poolWeight;

            emit WowStake_AddPool(
                _poolWeight,
                _minDepositAmount,
                s_stakePoolList.length
            );
        }
    }

    function updatePoolWeigth(
        uint256 pid,
        uint256 poolWeight
    ) external onlyRole(ADMIN_ROLE) {
        require(!isOpen, "stake not close");
        Pool storage pool = s_stakePoolList[pid];
        uint256 oldPoolWeight = pool.poolWeight;
        pool.poolWeight = poolWeight;

        s_totalPoolWeight = s_totalPoolWeight - oldPoolWeight + poolWeight;

        emit WowStake_UpdatPool(msg.sender, pid, oldPoolWeight, poolWeight);
    }

    function updateStateStatus(bool _isOpen) external onlyRole(ADMIN_ROLE) {
        isOpen = _isOpen;
    }

    ///////////////////
    // Private Functions
    ///////////////////
    /**
     *
     * @param _stTokenAddress the address of stoken token (default ETH)
     */
    function initPools(address _stTokenAddress) private {
        s_stakePoolList.push(
            Pool({
                stTokenAddress: _stTokenAddress,
                poolWeight: 1,
                accWowPerST: 0,
                stTokenAmount: 0,
                remainRewardAmount: 0,
                minDepositAmount: 10 ether,
                unstakeLockedBlocks: 2
            })
        );

        s_stakePoolList.push(
            Pool({
                stTokenAddress: _stTokenAddress,
                poolWeight: 10,
                accWowPerST: 0,
                stTokenAmount: 0,
                remainRewardAmount: 0,
                minDepositAmount: 100 ether,
                unstakeLockedBlocks: 2
            })
        );

        s_stakePoolList.push(
            Pool({
                stTokenAddress: _stTokenAddress,
                poolWeight: 50,
                accWowPerST: 0,
                stTokenAmount: 0,
                remainRewardAmount: 0,
                minDepositAmount: 500 ether,
                unstakeLockedBlocks: 2
            })
        );

        s_totalPoolWeight = 1 + 10 + 50;
    }

    /**
     *
     * @param pid the id of the pool
     * @notice the function will create a stake order
     */
    function _createOrder(uint256 pid) internal returns (uint256) {
        StakeOrder memory newOrder = StakeOrder({
            userAddress: msg.sender,
            poolId: pid,
            stakeAmount: msg.value,
            stakeBlock: block.number,
            lastRewardBlock: block.number,
            remainRewardValue: 0,
            valid: true
        });

        stakeOrderListIndex[msg.sender][pid].push(newOrder);
        return stakeOrderListIndex[msg.sender][pid].length;
    }

    /**
     *
     * @param pid the id of pool
     * @notice this function will invalid all the stake orders of the pool
     */
    function _updateStakeOrderStatusByPool(
        uint256 pid,
        bool isUnstake
    ) private poolExist(pid) {
        StakeOrder[] storage userStakeOrderList = stakeOrderListIndex[
            msg.sender
        ][pid];
        Pool memory pool = s_stakePoolList[pid];
        for (uint256 i = 0; i < userStakeOrderList.length; i++) {
            StakeOrder storage stakeOrder = userStakeOrderList[i];
            console.log("stake orderrrrrr");
            console.log(stakeOrder.valid);
            if (isUnstake) {
                if (
                    block.number - stakeOrder.stakeBlock >
                    pool.unstakeLockedBlocks
                ) {
                    stakeOrder.lastRewardBlock = block.number;
                    stakeOrder.valid = false;
                }
            } else {
                stakeOrder.lastRewardBlock = block.number;
            }
        }
    }

    /**
     *
     * @param pid the id of pool
     * @param orderId the id the the stake order
     * @param isUnstake whether unstake methoce call this
     * @notice the function will invalid the specific stake order if unstake, and update the lastRewardBlock
     */
    function _updateStakeOrderStatusByOrder(
        uint256 pid,
        uint256 orderId,
        bool isUnstake
    ) private poolExist(pid) {
        StakeOrder[] storage userStakeOrderList = stakeOrderListIndex[
            msg.sender
        ][pid];
        StakeOrder storage stakeOrder = userStakeOrderList[orderId];
        stakeOrder.lastRewardBlock = block.number;
        if (isUnstake) {
            stakeOrder.valid = false;
        }
    }

    /**
     *
     * @param pid the id of the pool
     * @notice this function will increase the stake amount of the pool
     */
    function _increasePoolStakeAmount(uint256 pid) private poolExist(pid) {
        Pool storage pool = s_stakePoolList[pid];
        pool.stTokenAmount += msg.value;
        console.log("increase");
        console.log(pool.stTokenAmount);

        // pool.accWowPerST = pool.remainRewardAmount / pool.stTokenAmount;
    }

    /**
     *
     * @param pid the id of the pool
     * @notice this function will decrease the stake amount of the pool
     */
    function _decreasePoolStakeAmount(
        uint256 pid,
        uint256 amount
    ) private poolExist(pid) {
        Pool storage pool = s_stakePoolList[pid];

        require(pool.stTokenAmount >= amount, "unstake calculate error");
        pool.stTokenAmount -= amount;

        // pool.accWowPerST = pool.remainRewardAmount / pool.stTokenAmount;
    }

    //////////////////////////////
    // Private & Internal View & Pure Functions
    //////////////////////////////
    /**
     *
     * @param pid the id of the pool
     * @param orderId the id of the order
     * @notice  = (rewardAmountPerPool * stakedBlocks)/totalPool weight ; orderRewards = poolRewards * (orderStakeAmount/poolTotalStakeAmount)
     */
    function _calculationRewardByOrder(
        uint256 pid,
        uint256 orderId
    ) private view returns (uint256) {
        StakeOrder[] memory userStakeOrderList = getUserStakeOrders(pid);
        StakeOrder memory stakeOrder = userStakeOrderList[orderId];
        Pool memory pool = getPoolDetail(pid);
        uint256 stakeOrderReward;
        console.log("_calculationRewardByOrder_calculationRewardByOrder");
        console.log(stakeOrder.valid == true);
        if (stakeOrder.valid == true) {
            uint256 stakedBlocks = block.number - stakeOrder.lastRewardBlock;
            console.log("stakedBlocks");
            console.log(stakedBlocks);

            uint256 rewardAmountPerPool = (rewardTokenPerBlock *
                stakedBlocks *
                pool.poolWeight) / s_totalPoolWeight;
            console.log(rewardAmountPerPool);
            console.log(stakeOrder.stakeAmount);
            console.log(pool.stTokenAmount);
            uint256 mult = rewardAmountPerPool * stakeOrder.stakeAmount;
            stakeOrderReward = mult / pool.stTokenAmount;
        }

        return stakeOrderReward;
    }

    function _deposit(Pool memory pool) private {
        if (pool.stTokenAddress != address(0x0)) {
            IERC20 stakeToken = IERC20(pool.stTokenAddress);
            stakeToken.approve(address(this), msg.value);
            stakeToken.safeTransferFrom(msg.sender, address(this), msg.value);
        }
    }

    function _transferRewards(uint256 rewardAmount) private {
        IERC20(s_rewardToken).approve(address(this), rewardAmount);

        IERC20(s_rewardToken).safeTransferFrom(
            address(this),
            msg.sender,
            rewardAmount
        );
    }

    function _transferStakeToken(
        Pool memory pool,
        uint256 calculatedStakeAmount
    ) private {
        if (pool.stTokenAddress == address(0x0)) {
            (bool success, ) = payable(msg.sender).call{
                value: calculatedStakeAmount
            }("");
            require(success, "unstake error");
        } else {
            IERC20 stakeToken = IERC20(pool.stTokenAddress);

            stakeToken.safeTransferFrom(
                msg.sender,
                address(this),
                calculatedStakeAmount
            );
        }
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(ADMIN_ROLE) {}

    ////////////////////////////////////////////////////////////////////////////
    // External & Public View & Pure Functions
    ////////////////////////////////////////////////////////////////////////////
    /**
     *
     * @param pid the id of the pool
     * @param isUnstake  whether unstake call this method
     * @return tototalReward total rewards of the pool
     * @return calculatedStakeAmount total stake amount related to the rewards
     */
    function calculateRewardByPool(
        uint256 pid,
        bool isUnstake
    ) public view returns (uint256, uint256) {
        uint256 totalReward;
        uint256 calculatedStakeAmount;
        StakeOrder[] memory userStakeOrderList = getUserStakeOrders(pid);
        Pool memory pool = getPoolDetail(pid);

        for (uint256 i = 0; i < userStakeOrderList.length; i++) {
            StakeOrder memory stakeOrder = userStakeOrderList[i];
            if (isUnstake) {
                if (
                    block.number - stakeOrder.stakeBlock >
                    pool.unstakeLockedBlocks &&
                    stakeOrder.valid
                ) {
                    totalReward = _calculationRewardByOrder(pid, i);
                    calculatedStakeAmount += stakeOrder.stakeAmount;
                    console.log("calculateRewardByPool");
                    console.log(totalReward);
                }
            } else if (stakeOrder.valid) {
                totalReward = _calculationRewardByOrder(pid, i);
                calculatedStakeAmount += stakeOrder.stakeAmount;
            }
        }
        return (totalReward, calculatedStakeAmount);
    }

    /**
     *
     * @param pid the id of the pool
     * @param orderId the id of the order
     * @return totalRwards total rewards of the order
     */
    function calculateRewardByOrder(
        uint256 pid,
        uint256 orderId
    ) public view poolExist(pid) returns (uint256) {
        return _calculationRewardByOrder(pid, orderId);
    }

    /**
     *
     * @param pid the id of the pool
     * @return StakeOrder[]  all stake orders of this pool for the user
     */
    function getUserStakeOrders(
        uint256 pid
    ) public view poolExist(pid) returns (StakeOrder[] memory) {
        StakeOrder[] memory userStakeOrderList = stakeOrderListIndex[
            msg.sender
        ][pid];
        return userStakeOrderList;
    }

    function getUserStakeOrder(
        uint256 pid,
        uint256 orderId
    ) external view poolExist(pid) returns (StakeOrder memory) {
        StakeOrder[] memory userStakeOrderList = getUserStakeOrders(pid);
        return userStakeOrderList[orderId];
    }

    /**
     *
     * @param pid the id of the pool
     * @return Pool
     */
    function getPoolDetail(
        uint256 pid
    ) public view poolExist(pid) returns (Pool memory) {
        return s_stakePoolList[pid];
    }

    /**
     *
     * @return Pool
     */
    function getAllPoolDetail() public view returns (Pool[] memory) {
        return s_stakePoolList;
    }

    /**
     *
     * @param pid the id of the pool
     * @return totalRewadAmount total reward amount of the user for the pool
     */
    function getUserTotalRewardByPool(
        uint256 pid
    ) external view poolExist(pid) returns (uint256) {
        return userRewardAmount[msg.sender][pid];
    }

    /**
     *@return totalRewards total rewards of the user
     */
    function getUserReward() external view returns (uint256) {
        uint256 totalRewards;
        for (uint256 i = 0; i < s_stakePoolList.length; i++) {
            totalRewards = userRewardAmount[msg.sender][i];
        }
        return totalRewards;
    }

    function expectRewardAmount(
        uint256 pid,
        uint256 orderId
    ) external view returns (uint256) {
        return calculateRewardByOrder(pid, orderId);
    }

    function getRewardTokenPerBlock() public view returns (uint256) {
        return rewardTokenPerBlock;
    }

    function getTotalPoolWeight() external view returns (uint256) {
        return s_totalPoolWeight;
    }

    function balance() public view returns (uint256) {
        return address(this).balance;
    }

    function test() public returns (uint256) {
        return 1;
    }
}
