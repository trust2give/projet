// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {T2GTypes} from "../libraries/Types.sol";
import { LibDiamond } from "../libraries/LibDiamond.sol";
import { T2G_HoneyFacet } from "./HoneyFacet.sol";
import {LibERC721} from "../libraries/LibERC721.sol";
import { DiamondLoupeFacet } from "./DiamondLoupeFacet.sol";
import { LibOwners } from "../libraries/LibOwners.sol";


/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.fr>, Github: @fdervillez
* T2G_PoolFacet
*
* Implementation of a Trust2Give Nektar Reward Token.
/******************************************************************************/

/// @title Contract that manages the Nektar Token for Trust2Give dApp

contract T2G_PoolFacet {

    string constant seed = "pool trust truth ability flower economy early earn actor agent air amount";
    bytes32 constant privKey = 0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd;
    //bytes constant pubKey =  "02f29df5888ba537b46ac8c42db3012f322111f19e70f2ae07c10a8b94139b67b2";
    address constant wallet = 0xbDA5747bFD65F08deb54cb465eB87D40e51B197E;

    error PoolInvalidSender(address sender);
    error PoolInvalidContractAddress();
    error PoolInvalidValueTransfered(uint256 value);

    event PoolRootAddressSet( address root );
    event PoolReceivedAmount( uint256 value, uint256 balance );

    modifier isT2GOwner {
        if (msg.sender != LibDiamond.contractOwner()) revert PoolInvalidSender(msg.sender);
        _;
        }

    modifier isT2GOwnerOrHoneyContract {
        address honeyAddress = T2G_HoneyFacet(LibERC721.layout().root).get_T2G_HoneyFacet();

        if (msg.sender != LibDiamond.contractOwner() && msg.sender != honeyAddress) revert PoolInvalidSender(msg.sender);
        _;
        }

    constructor( address _root ) payable {
        if (_root == address(0)) revert PoolInvalidContractAddress();
        else if (LibERC721.layout().root == address(0)) {
            LibERC721.layout().root = _root;
            emit PoolRootAddressSet( _root );
            }
        else if (_root != LibERC721.layout().root) revert PoolInvalidContractAddress();
        }

    function wallet_PoolFacet() external pure returns ( address _wallet, bytes32 _key ) {
        //byes32 _key = generatePrivateKey( seed );
        _wallet = wallet; // address( bytes20(keccak256( bytes(pubKey) )));
        _key = privKey;
        }

    function poolTransfertFrom() external isT2GOwnerOrHoneyContract payable {
        if (msg.value == 0) revert PoolInvalidValueTransfered(msg.value);
        emit PoolReceivedAmount( msg.value, address(this).balance );
        //address(this).balance = _value;
        }

     /// @notice returns the address of the the contract
     /// @dev All Facet in T2G application must implement this function of type "get_<Contract Name>()
     /// @return Address of the current instance of contract
    function get_T2G_PoolFacet() public view returns (address) {
        return address(DiamondLoupeFacet(LibERC721.layout().root).facetAddress(bytes4(abi.encodeWithSignature("beacon_PoolFacet()"))));
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
        return address(DiamondLoupeFacet(LibERC721.layout().root).facetAddress(bytes4(abi.encodeWithSignature("beacon_PoolFacet()")))).balance;
        }

    }