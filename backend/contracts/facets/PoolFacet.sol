// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {T2GTypes} from "../libraries/Types.sol";
import { LibDiamond } from "../libraries/LibDiamond.sol";
import { T2G_HoneyFacet } from "./HoneyFacet.sol";


/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.fr>, Github: @fdervillez
* T2G_PoolFacet
*
* Implementation of a Trust2Give Nektar Reward Token.
/******************************************************************************/

/// @title Contract that manages the Nektar Token for Trust2Give dApp

contract T2G_PoolFacet {

    address private diamond;

    error PoolInvalidSender(address sender);
    error PoolInvalidContractAddress();
    error PoolInvalidValueTransfered(uint256 value);

    modifier isT2GOwner {
        if (msg.sender != LibDiamond.contractOwner()) revert PoolInvalidSender(msg.sender);
        _;
        }

    modifier isT2GOwnerOrHoneyContract {
        address honeyAddress = T2G_HoneyFacet(diamond).get_T2G_HoneyFacet();

        if (msg.sender != LibDiamond.contractOwner() && msg.sender != honeyAddress) revert PoolInvalidSender(msg.sender);
        _;
        }

    constructor( address _root ) payable {
        if (_root == address(0)) revert PoolInvalidContractAddress();
        diamond = _root;
        }

    function poolTransfertFrom( uint256 _value ) public isT2GOwnerOrHoneyContract payable {
        if (_value == 0) revert PoolInvalidValueTransfered(_value);
        //address(this).balance = _value;
        }

     /// @notice returns the address of the the contract
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert HoneyInvalidSender error
     /// @dev All Facet in T2G application must implement this function of type "get_<Contract Name>()
     /// @return Address of the current instance of contract
    function get_T2G_PoolFacet() public isT2GOwner view returns (address) {
        return address(this);        
        }

     /// @notice checks that the deployed contract is alive and returns its version
     /// @dev the returned text is to be updated whenever a change in the contract is made and new deployment is carried out
     /// @return string that recalls the contact name + its current deployed version : "contractname::version"

    function beacon_PoolFacet() public pure returns (string memory) { return "T2G_PoolFacet::1.0.2"; }

     /// @notice returns the amount currently remaining on the contract balance in native coin
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert HoneyInvalidSender error
     /// @dev the native coin is either ETH, POL or any other EVM compliant blockchain where the contract is deployed in
     /// @dev the contract is inside an ERC2535 structure, so the value refers to this contract and not the diamond root
     /// @return uint amount of native token in WEI or equivalent

    function poolBalanceOf() external isT2GOwner view returns (uint) {
        return address(this).balance;        
        }

    }