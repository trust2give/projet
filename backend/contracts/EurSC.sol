// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract EUR is ERC20, ERC20Burnable {
    constructor() ERC20("EUR StableCoin for T2G Mock-up", "EUR") {
        _mint(msg.sender, 100_000_000_000 * 10**18 );
    }
}