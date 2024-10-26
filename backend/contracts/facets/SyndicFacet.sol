// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { LibOwners } from "../libraries/LibOwners.sol";
import { LibDiamond } from "../libraries/LibDiamond.sol";


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

    function beacon_SyndicFacet() public pure returns (string memory) { return "SyndicFacet::1.0.0"; }

    function registerWallet( address _wallet ) external isT2GOwner {
        LibOwners._register(_wallet);
        }

    function banWallet( address _wallet ) external isT2GOwner {
        LibOwners._ban(_wallet);(_wallet);
        }

}