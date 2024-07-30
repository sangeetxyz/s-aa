// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract AAAuthToken is ERC20, ERC20Permit {
	constructor(
		address initialOwner
	) ERC20("AA Auth Token", "AAAT") ERC20Permit("AA Auth Token") {}

	function mint(address to, uint256 amount) public {
		_mint(to, amount);
	}
}
