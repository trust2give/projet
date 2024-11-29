// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { LibOwners } from "../libraries/LibOwners.sol";
import { LibDiamond } from "../libraries/LibDiamond.sol";
import { DiamondLoupeFacet } from "./DiamondLoupeFacet.sol";

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.fr>, Github: @fdervillez
* T2G_HoneyFacet
*
* Implementation of a Trust2Give Syndication Smart Contract.
* Version
* 1.0.1 : Creation of the smart contract with 4 main functions
/******************************************************************************/

/// @title Contract that manages the registration process for Trust2Give dApp
/// @title a user is represented by a wallet address and is given rights to use
/// @title part of the services

/// There are six types of user profiles:
/// Profile 1 [P1] : Public viewer : wallet that can access public data managed by the service (bu default)
/// Profile 2 [P2] : Giver : any wallet that is willing to give funds and stablecoins
/// Profile 3 [P3] : GHG Gain Collector : any wallet that belong to an entity seeking, carrying out and valueing GHG gains
/// Profile 4 [P4] : Certifier : any wallet that is allowed to certify and endorse the reality of GHG gains declared
/// Profile 5 [P5] : T2G Governor : any wallet that owns Gouvernance Tokens
/// Profile 6 [P6] : T2G Owner : any wallet that belongs to T2G organization

/// Access to smart contract facets depends on the rights linked to a wallet
/// Honey Facet  : P1 (Partial) / P2 (Full) / P6 (Full)
/// Pollen Facet : P1 (Partial) / P3 (Full) / P4 (Certifier) / P6 (Full)
/// Nektar Facet : P1 (Full) / P2 (Full) / P3 (Full) / P6 (Full)
/// Pool Facet   : P6 (Full)
/// Cell Facet   : P5 (Full) / P6 (Full)

/// Each profile may have sublevels of profiles and is identified by a flag, set or unset depending on the rights
/// P1 : R_VIEWS
/// P2 : R_GIVES
/// P3 is splitted into two roles : R_FARMS (Creator) & R_COLLECTS (Apicist)
/// P4 : R_GRANTS
/// P5 : R_OWNS
/// P6 : R_ADMINS

contract T2G_SyndicFacet {

    string constant seed = "";
    bytes32 constant privKey = 0x0;
    bytes constant pubKey =  "0000000000000000000000000000000000000000000000000000000000000000";

    error SyndicInvalidContractAddress(string facet);
    error SyndicInvalidSender(address sender);

    event SyndicRootAddressSet(address sender);

    modifier isT2GOwner {
        if (msg.sender != LibDiamond.contractOwner()) revert SyndicInvalidSender(msg.sender);
        _;
        }

    constructor( address _root ) {
        if (_root == address(0)) revert SyndicInvalidContractAddress("Root");
        else if (LibOwners.syndication().root == address(0)) {
            LibOwners.syndication().root = _root;
            emit SyndicRootAddressSet( _root );
            }
        else if (_root != LibOwners.syndication().root) revert SyndicInvalidContractAddress("Root");
        }    

    function wallet_SyndicFacet() external pure returns ( address _wallet, bytes32 _key ) {
        //byes32 _key = generatePrivateKey( seed );
        _wallet = address( bytes20(keccak256( bytes(pubKey) )));
        _key = privKey;
        }

     /// @notice returns the address of the the contract
     /// @dev All Facet in T2G application must implement this function of type "get_<Contract Name>()
     /// @return Address of the current instance of contract
     
    function get_T2G_SyndicFacet() public view returns (address) {
        return DiamondLoupeFacet(LibOwners.syndication().root).facetAddress(bytes4(abi.encodeWithSignature("beacon_SyndicFacet()")));
        }

     /// @notice checks that the deployed contract is alive and returns its version
     /// @dev the returned text is to be updated whenever a change in the contract is made and new deployment is carried out
     /// @return string that recalls the contact name + its current deployed version : "contractname::version"

    function beacon_SyndicFacet() public pure returns (string memory) { return "SyndicFacet::1.0.1"; }

     /// @notice checks that the wallet address is registered as a user of T2G service
     /// @dev this function is only callable by the T2GOwner otherwise reverts, to check is a given address is registered
     /// @dev registered does not mean active. It means that the wallet has already been interacting at least once with the service
     /// @return bool true if the wallet is registered, false otherwise

     /// @notice returns the rights of a given wallet
     /// @dev if the wallet address is not registered yet or banned, then revert SyndFordidden error
     /// @return uint8 value of the rights granted to the wallet @. Values are related to USR_XXXX flags
     
    function getWalletRights( address _wallet ) public view returns (uint8) {
        return LibOwners._rights(_wallet);
        }

    function isWalletRegistered( address _wallet ) external isT2GOwner view returns( bool ) {
        return LibOwners._isRegistered(_wallet);
        } 

     /// @notice checks that the wallet address is banned as a user of T2G service
     /// @dev this function is only callable by the T2GOwner, otherwise reverts, to check is a given address is banned
     /// @dev banned implies that the wallet is also registered but no more allowed to use the service.
     /// @return bool true if the wallet is banned, false otherwise

    function isWalletBanned( address _wallet ) external isT2GOwner view returns( bool ) {
        return LibOwners._isBanned(_wallet);
        } 

     /// @notice register the wallet address, similar to sign-up process. From this moment on, the wallet is allowed to use the services
     /// @dev this a static & permanent registration. Once done, it can not be deleted or canceled for tracability reasons
     /// @dev An event is emitted depending on the status : SyndNewRegistered when registration process went through
     /// @dev SyndAlreadyRegistered event in case the wallet address is already in
     /// @dev SyndAlreadyBanned event in case the wallet address is already registered AND banned

    function registerWallet( address _wallet, uint8 _profile ) external isT2GOwner {
        LibOwners._register( _wallet, _profile );
        }

     /// @notice allow additionnal rights to a given wallet address
     /// @dev An event is emitted : SyndRightsGranted when setting process went through
     /// @dev if the wallet address is not registered yet or banned, then revert SyndFordidden error

    function grantWalletRights( address _wallet, uint8 _profile ) external isT2GOwner {
        LibOwners._grantRights( _wallet, _profile );
        }

     /// @notice restrict rights to a given wallet address
     /// @dev An event is emitted : SyndRightsDeclined when setting process went through
     /// @dev if the wallet address is not registered yet or banned, then revert SyndFordidden error

    function declineWalletRights( address _wallet, uint8 _profile ) external isT2GOwner {
        LibOwners._grantRights( _wallet, _profile );
        }

     /// @notice ban the wallet address. From this moment on, the wallet is no longer allowed to use the services
     /// @dev this a static & permanent ban. Once done, it can not be deleted or canceled for tracability reasons
     /// @dev An event is emitted depending on the status : SyndNewBanned when process went through
     /// @dev SyndUnknown event in case the wallet address is not known
     /// @dev SyndAlreadyBanned event in case the wallet address is already banned

    function banWallet( address _wallet ) external isT2GOwner {
        LibOwners._ban(_wallet);
        }
    
    function getAddressAndKeys( address _smart ) external view returns (address, bytes32) {
        return (LibOwners.syndication().boundWallet[_smart], LibOwners.syndication().boundKey[_smart]);
        }

}