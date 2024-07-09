// contracts/OurToken.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WowToken is ERC20 {
    constructor(uint256 amount) ERC20("WowToken", "WOW") {
        _mint(msg.sender, amount);
    }

    function mint(address user, uint256 amount) public {
        _mint(user, amount);
    }
}
