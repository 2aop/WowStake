export const contractAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"
export const abi = [
  {
    type: "function",
    name: "ADMIN_ROLE",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "DEFAULT_ADMIN_ROLE",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "UPGRADE_INTERFACE_VERSION",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addPool",
    inputs: [
      { name: "_poolWeight", type: "uint256", internalType: "uint256" },
      {
        name: "_minDepositAmount",
        type: "uint256",
        internalType: "uint256",
      },
      { name: "_tokenAdress", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balance",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "calculateRewardByOrder",
    inputs: [
      { name: "pid", type: "uint256", internalType: "uint256" },
      { name: "orderId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "calculateRewardByPool",
    inputs: [
      { name: "pid", type: "uint256", internalType: "uint256" },
      { name: "isUnstake", type: "bool", internalType: "bool" },
    ],
    outputs: [
      { name: "", type: "uint256", internalType: "uint256" },
      { name: "", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "expectRewardAmount",
    inputs: [
      { name: "pid", type: "uint256", internalType: "uint256" },
      { name: "orderId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAllPoolDetail",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct WowStake.Pool[]",
        components: [
          {
            name: "stTokenAddress",
            type: "address",
            internalType: "address",
          },
          {
            name: "poolWeight",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "accWowPerST",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "stTokenAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "remainRewardAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "minDepositAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "unstakeLockedBlocks",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPoolDetail",
    inputs: [{ name: "pid", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct WowStake.Pool",
        components: [
          {
            name: "stTokenAddress",
            type: "address",
            internalType: "address",
          },
          {
            name: "poolWeight",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "accWowPerST",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "stTokenAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "remainRewardAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "minDepositAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "unstakeLockedBlocks",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRewardByOrder",
    inputs: [
      { name: "pid", type: "uint256", internalType: "uint256" },
      { name: "orderId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getRewardTokenPerBlock",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRewardsByPool",
    inputs: [{ name: "pid", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getRoleAdmin",
    inputs: [{ name: "role", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTotalPoolWeight",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserReward",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserStakeOrder",
    inputs: [
      { name: "pid", type: "uint256", internalType: "uint256" },
      { name: "orderId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct WowStake.StakeOrder",
        components: [
          {
            name: "userAddress",
            type: "address",
            internalType: "address",
          },
          { name: "poolId", type: "uint256", internalType: "uint256" },
          {
            name: "stakeAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "stakeBlock",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "lastRewardBlock",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "remainRewardValue",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "valid", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserStakeOrders",
    inputs: [{ name: "pid", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct WowStake.StakeOrder[]",
        components: [
          {
            name: "userAddress",
            type: "address",
            internalType: "address",
          },
          { name: "poolId", type: "uint256", internalType: "uint256" },
          {
            name: "stakeAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "stakeBlock",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "lastRewardBlock",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "remainRewardValue",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "valid", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserTotalRewardByPool",
    inputs: [{ name: "pid", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "grantRole",
    inputs: [
      { name: "role", type: "bytes32", internalType: "bytes32" },
      { name: "account", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "hasRole",
    inputs: [
      { name: "role", type: "bytes32", internalType: "bytes32" },
      { name: "account", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "initialize",
    inputs: [
      {
        name: "_stakeTokenAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "_rewardTokenAddress",
        type: "address",
        internalType: "address",
      },
      {
        name: "_rewardTokenPerBlock",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "proxiableUUID",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "renounceRole",
    inputs: [
      { name: "role", type: "bytes32", internalType: "bytes32" },
      {
        name: "callerConfirmation",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "revokeRole",
    inputs: [
      { name: "role", type: "bytes32", internalType: "bytes32" },
      { name: "account", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "stake",
    inputs: [{ name: "pid", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "supportsInterface",
    inputs: [{ name: "interfaceId", type: "bytes4", internalType: "bytes4" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "test",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unstakeByOrder",
    inputs: [
      { name: "pid", type: "uint256", internalType: "uint256" },
      { name: "orderId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unstakeByPool",
    inputs: [{ name: "pid", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updatePoolWeigth",
    inputs: [
      { name: "pid", type: "uint256", internalType: "uint256" },
      { name: "poolWeight", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateStateStatus",
    inputs: [{ name: "_isOpen", type: "bool", internalType: "bool" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "upgradeToAndCall",
    inputs: [
      {
        name: "newImplementation",
        type: "address",
        internalType: "address",
      },
      { name: "data", type: "bytes", internalType: "bytes" },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "event",
    name: "Initialized",
    inputs: [
      {
        name: "version",
        type: "uint64",
        indexed: false,
        internalType: "uint64",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoleAdminChanged",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "previousAdminRole",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "newAdminRole",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoleGranted",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoleRevoked",
    inputs: [
      {
        name: "role",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Upgraded",
    inputs: [
      {
        name: "implementation",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WowStake_AddPool",
    inputs: [
      {
        name: "poolWeight",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "minDepositAmountin",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "pid",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WowStake_GetRewardsByOrder",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "pid",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "order",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WowStake_GetRewardsByPool",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "pid",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WowStake_GetRewardsOfUnstakeByOrder",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "pid",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "orderId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WowStake_GetRewardsOfUnstakeByPool",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "pid",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WowStake_Stake",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "pid",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "orderId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WowStake_UnStakeByOrder",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "pid",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "orderId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WowStake_UnStakeByPool",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "pid",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "WowStake_UpdatPool",
    inputs: [
      {
        name: "admin",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "pid",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "oldWeight",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "newWeight",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  { type: "error", name: "AccessControlBadConfirmation", inputs: [] },
  {
    type: "error",
    name: "AccessControlUnauthorizedAccount",
    inputs: [
      { name: "account", type: "address", internalType: "address" },
      { name: "neededRole", type: "bytes32", internalType: "bytes32" },
    ],
  },
  {
    type: "error",
    name: "AddressEmptyCode",
    inputs: [{ name: "target", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "ERC1967InvalidImplementation",
    inputs: [
      {
        name: "implementation",
        type: "address",
        internalType: "address",
      },
    ],
  },
  { type: "error", name: "ERC1967NonPayable", inputs: [] },
  { type: "error", name: "FailedCall", inputs: [] },
  { type: "error", name: "InvalidInitialization", inputs: [] },
  { type: "error", name: "NotInitializing", inputs: [] },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
  },
  { type: "error", name: "UUPSUnauthorizedCallContext", inputs: [] },
  {
    type: "error",
    name: "UUPSUnsupportedProxiableUUID",
    inputs: [{ name: "slot", type: "bytes32", internalType: "bytes32" }],
  },
]
