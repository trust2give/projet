// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract EUR is ERC20, ERC20Burnable {

    event EurTrace( string _from, address _sender, address _sc, address _to,uint256 _amount );

    
    constructor() ERC20("EUR StableCoin for T2G Mock-up", "EUR") {
        emit EurTrace( "Constructor", msg.sender, address(0), address(0), 100_000_000_000 * 10**18);
        _mint(msg.sender, 100_000_000_000 * 10**18 );
    }

    /// @notice returns the address of the the contract
    /// @dev All Facet in T2G application must implement this function of type "get_<Contract Name>()
    /// @return Address of the current instance of contract
     
    function get_EUR() public view returns (address) {
        return address(this);
        }

    function get_Caller() public view returns (address) {
        return address(msg.sender);
        }

    function transferFrom( address sender, address recipient, uint256 amount) public override returns (bool) {
            emit EurTrace( "transferFrom", msg.sender, sender, recipient, amount);
            return ERC20.transferFrom( sender, recipient, amount);
        }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
            emit EurTrace( "transfer", msg.sender, address(this), recipient, amount);
            return ERC20.transfer(recipient, amount);
        }

    function approve(address spender, uint256 amount) public override returns (bool) {
            emit EurTrace( "approve", msg.sender, address(this), spender, amount);
            return ERC20.approve(spender, amount);
        }

}