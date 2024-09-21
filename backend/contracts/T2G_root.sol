// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.26;

/* Contract Hive - Version Remix Compiler 0.8.18 OK : 27/05/2023 Edition 1.0
 * @title Hive contract for Hive Solution
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Ce contract est le contrat racine de toute la ruche et sert de point
 * d'entrée à l'ensemble des fonctions selon une architecture Diamond et le
 * standard EIP-2535 Diamond Architecture
*/
import {Ownable} from "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.3.0/contracts/access/Ownable.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.3.0/contracts/token/ERC20/ERC20.sol";

import "./libraries/AppStorage.sol";
import "./libraries/LibDiamond.sol";
import "./interfaces/IDiamondLoupe.sol";
import "./interfaces/IDiamondCut.sol";
import "./libraries/utils/LibDate.sol";
//import "./facets/HivePollen.sol";
import "./Diamond.sol";


/* Ceci est le contrat root de la Ruche
   Developpement selon une architexture EIP2535 - Diamond Facets
   Le contrat Hive est le contrat de Data Storage
   Les facettes sont les suivantes :
   1. FACET1 : Users
   2. FACET2 : comptes
   3. FACET3 : Pollens
   4. FACET4 : Nektats
   5. FACET5 : Miels
   6. FACET6 : Cells */

contract Hive is Diamond {
  AppStorage internal s;

  using LibDate for TimeStamp;

  function beacon_Hive() public pure returns (string memory) { return "Hive::1.0.0"; }

  //IDiamondCut.FacetCut[] memory _diamondCut, DiamondArgs memory _args
  constructor(IDiamondCut.FacetCut[] memory _diamondCut, DiamondArgs memory _args) Diamond(_diamondCut, _args) {
      //LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
      //RightValue[] storage list = new RightValue[](0);

      s.seed = uint256(0);
      s.owner = _args.owner;
      //s.chronos.timestamp = block.timestamp;
      //s.chronos.parseTimestamp();
      // adding ERC165 data
      //ds.supportedInterfaces[type(IERC165).interfaceId] = true;
      //ds.supportedInterfaces[type(IDiamondCut).interfaceId] = true;
      //ds.supportedInterfaces[type(IDiamondLoupe).interfaceId] = true;
      //ds.supportedInterfaces[type(IERC173).interfaceId] = true;
      // ERC1155
      // ERC165 identifier for the main token standard.
      //ds.supportedInterfaces[0xd9b67a26] = true;
      // ERC1155
      // ERC1155Metadata_URI
      //ds.supportedInterfaces[IERC1155Metadata_URI.uri.selector] = true;
    }
}


contract MyContract is Ownable {
    constructor(address initialOwner) Ownable(initialOwner) {}

    function normalThing() public {
        // anyone can call this normalThing()
    }

    function specialThing() public onlyOwner {
        // only the owner can call specialThing()!
    }
}