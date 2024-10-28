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

contract T2G_SyndicFacet {

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

    function registerWallet( address _wallet ) external isT2GOwner {
        LibOwners._register(_wallet);
        }

     /// @notice ban the wallet address. From this moment on, the wallet is no longer allowed to use the services
     /// @dev this a static & permanent ban. Once done, it can not be deleted or canceled for tracability reasons
     /// @dev An event is emitted depending on the status : SyndNewBanned when process went through
     /// @dev SyndUnknown event in case the wallet address is not known
     /// @dev SyndAlreadyBanned event in case the wallet address is already banned

    function banWallet( address _wallet ) external isT2GOwner {
        LibOwners._ban(_wallet);(_wallet);
        }

     /// @notice this function is used to change the address for the smart contract that simulate StableCoin

    function updateMockUpAddress( address _mockup ) external isT2GOwner {
        LibOwners.syndication().scAddress = _mockup;
        }
}