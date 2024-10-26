// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
*
* Implementation of a diamond.
/******************************************************************************/

import { LibDiamond } from "../libraries/LibDiamond.sol";
import { LibOwners } from "../libraries/LibOwners.sol";
import { LibERC721 } from "../libraries/LibERC721.sol";
import { IDiamondLoupe } from "../interfaces/IDiamondLoupe.sol";
import { IDiamondCut } from "../interfaces/IDiamondCut.sol";
import { IERC173 } from "../interfaces/IERC173.sol";
import { IERC165 } from "../interfaces/IERC165.sol";
import { IERC721 } from "../interfaces/IERC721.sol";
import { IERC721Metadata } from "../interfaces/IERC721Metadata.sol";

// It is expected that this contract is customized if you want to deploy your diamond
// with data from a deployment script. Use the init function to initialize state variables
// of your diamond. Add parameters to the init function if you need to.

contract DiamondInit {    

    // You can add parameters to this function in order to pass in 
    // data to set your own state variables
    function init(string memory _name, string memory _symbol, address _root) external {
        // adding ERC165 data
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        ds.supportedInterfaces[type(IERC165).interfaceId] = true;
        ds.supportedInterfaces[type(IDiamondCut).interfaceId] = true;
        ds.supportedInterfaces[type(IDiamondLoupe).interfaceId] = true;
        ds.supportedInterfaces[type(IERC173).interfaceId] = true;
        ds.supportedInterfaces[type(IERC721).interfaceId] = true;
        ds.supportedInterfaces[type(IERC721Metadata).interfaceId] = true;

        LibERC721.Layout storage layout = LibERC721.layout();
        LibOwners.Syndication storage syndication = LibOwners.syndication();

        layout.idFeatures[uint256(LibERC721.Typeoftoken.None)].name = _name;
        layout.idFeatures[uint256(LibERC721.Typeoftoken.None)].symbol = _symbol;

        layout.root = _root;

        syndication.root = _root;
        syndication.totalBanned = 0;
        syndication.totalRegistered = 0;

        // add your own state variables 
        // EIP-2535 specifies that the `diamondCut` function takes two optional 
        // arguments: address _init and bytes calldata _calldata
        // These arguments are used to execute an arbitrary function using delegatecall
        // in order to set state variables in the diamond during deployment or an upgrade
        // More info here: https://eips.ethereum.org/EIPS/eip-2535#diamond-interface 
        
        layout.idFeatures[uint256(LibERC721.Typeoftoken.Honey)].name = "HONEY";
        layout.idFeatures[uint256(LibERC721.Typeoftoken.Honey)].symbol = "HNY";
        layout.idFeatures[uint256(LibERC721.Typeoftoken.Pollen)].name = "POLLEN";
        layout.idFeatures[uint256(LibERC721.Typeoftoken.Pollen)].symbol = "POL";
        layout.idFeatures[uint256(LibERC721.Typeoftoken.Nektar)].name = "NEKTAR";
        layout.idFeatures[uint256(LibERC721.Typeoftoken.Nektar)].symbol = "NKT";
        layout.idFeatures[uint256(LibERC721.Typeoftoken.Cell)].name = "CELL";
        layout.idFeatures[uint256(LibERC721.Typeoftoken.Cell)].symbol = "CEL";
    }


}