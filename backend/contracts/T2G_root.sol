// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

/* Contract T2G_root - Version Remix Compiler 0.8.18 OK : 27/05/2023 Edition 1.0
 * @title T2G_root contract for Trust2Give Solution
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Ce contract est le contrat racine de toute la dApp et sert de point
 * d'entrée à l'ensemble des fonctions selon une architecture Diamond et le
 * standard EIP-2535 Diamond Architecture
*/

//import {Ownable} from "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.2/contracts/access/Ownable.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.3.0/contracts/token/ERC20/ERC20.sol";

//import "./libraries/AppStorage.sol";
import "./libraries/LibDiamond.sol";
//import "./interfaces/IDiamondLoupe.sol";
//import "./interfaces/IDiamondCut.sol";
//import "./libraries/utils/LibDate.sol";
//import "./facets/HivePollen.sol";
import "./Diamond.sol";
import { DiamondLoupeFacet } from "./facets/DiamondLoupeFacet.sol";


/* Ceci est le contrat root de la Ruche
   Developpement selon une architexture EIP2535 - Diamond Facets
   Le contrat T2G_root est le contrat de Data Storage
   Les facettes sont les suivantes :
   1. FACET1 : Users
   2. FACET2 : comptes
   3. FACET3 : Pollens
   4. FACET4 : Nektats
   5. FACET5 : Miels
   6. FACET6 : Cells */

contract T2G_root is Diamond {
  //AppStorage internal s;
  //using LibDate for TimeStamp;

  event T2GrootReceived( address sender, uint256 value );
  error T2GrootInvalidSender(address sender);

  modifier isT2GOwner {
    if (msg.sender != LibDiamond.contractOwner()) revert T2GrootInvalidSender(msg.sender);
    _;
    }


  function beacon_T2G_Root() public pure returns (string memory) { return "T2G_root::1.0.0"; }

  //IDiamondCut.FacetCut[] memory _diamondCut, DiamondArgs memory _args
    constructor(address _contractOwner, address _diamondCutFacet) Diamond(_contractOwner, _diamondCutFacet) payable {
      //LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
      //RightValue[] storage list = new RightValue[](0);

      //s.seed = uint256(0);
      //s.owner = _args.owner;
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

  /// @notice returns the amount currently remaining on the contract balance in native coin
  /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert HoneyInvalidSender error
  /// @dev the native coin is either ETH, POL or any other EVM compliant blockchain where the contract is deployed in
  /// @dev the contract is inside an ERC2535 structure, so the value refers to this contract and not the diamond root
  /// @return uint amount of native token in WEI or equivalent

  function balanceOfRoot() external isT2GOwner view returns (uint) {
      return address(this).balance;
      }

  function sendFundsToHoney(address _honey) external payable {
    //address _honey = DiamondLoupeFacet(address(this)).facetAddress(bytes4(abi.encodeWithSignature("beacon_HoneyFacet()")));
    payable(_honey).transfer(msg.value);
    emit T2GrootReceived(msg.sender, msg.value);
  }

}