// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

// Librairie implémentant un journal de traçabilité des enregistrements

import "./LibPollenData.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


library LibPollenSts {

  bool constant YES = true;
  bool constant NO = false;

  using LibObjCard for ObjCard;
  using LibStatus for StatusLog;
  using LibErrors for *;
  using StringUtilsLib for *;
  using LibIdentifier for IdLog;
  using LibPollenData for PollenStorage;
  using LinkedListLib for LinkedListLib.LinkedList;

  // Version 1.0.1 : Change isDraft revert function to require
  // Version 1.0.2 : Bug Fix isDraft revert function to require
  // Version 1.0.3 : Change functions revert function to require
  function beacon_LibPollenSts() public pure returns (string memory) { return "LibPollenSts::1.0.3"; }

  function isDraft(PollenStorage storage _self, bytes32 _id) external view returns (Pollen storage _pollen) {
    _pollen = _self.isPollen(_id);
    (PollenStatus current, , ) = _pollen.status.currentPollen();
    require ((current == PollenStatus.DRAFT), "Pollen not editable ");
    }

  function isCertified(PollenStorage storage _self, bytes32 _id) external view returns (Pollen storage _pollen) {
    _pollen = _self.isPollen(_id);
    (PollenStatus current, , ) = _pollen.status.currentPollen();
    require ((current == PollenStatus.CERTIFIED), "Pollen not certified ");
    }

  /// @dev activate a specific registered POLLEN with already DRAFT or BOUND status
  /// @param _self stored PollenStorage structure that contains user object
  /// @param _id bytes32 of the POLLEN to activate
  function certify( PollenStorage storage _self, bytes32 _id, string calldata _tag) external {
    Pollen storage pollen = _self.isPollen(_id);
    (PollenStatus current, , ) = pollen.status.currentPollen();
    require ((current == PollenStatus.DRAFT || current == PollenStatus.BOUND), "Pollen status Error"); 
    pollen.status.changePollen(PollenStatus.CERTIFIED, _tag);
    }

  /// @dev bind a specific registered POLLEN with already CERTIFY status
  /// @param _self stored PollenStorage structure that contains user object
  /// @param _id bytes32 of the POLLEN to freeze
  function bind( PollenStorage storage _self, bytes32 _id, string calldata _tag) external {
    Pollen storage pollen = _self.isPollen(_id);
    (PollenStatus current, , ) = pollen.status.currentPollen();
    require ((current == PollenStatus.CERTIFIED), "Pollen not certified ");
    pollen.status.changePollen(PollenStatus.BOUND, _tag);
    }

  /// @dev eat a specific registered POLLEN with already BOUND status
  /// @param _self stored PollenStorage structure that contains user object
  /// @param _id bytes32 of the POLLEN to close
  function eat( PollenStorage storage _self, bytes32 _id, string calldata _tag) external {
    Pollen storage pollen = _self.isPollen(_id);
    (PollenStatus current, , ) = pollen.status.currentPollen();
    require ((current == PollenStatus.BOUND), "Pollen not bound");
    pollen.status.changePollen(PollenStatus.EATEN, _tag);
    }

  /// @dev cancel a specific registered POLLEN with already DRAFT status
  /// @param _self stored PollenStorage structure that contains user object
  /// @param _id bytes32 of the POLLEN to close
  function cancel( PollenStorage storage _self, bytes32 _id, string calldata _tag) external {
    Pollen storage pollen = _self.isPollen(_id);
    (PollenStatus current, , ) = pollen.status.currentPollen();
    require ((current == PollenStatus.DRAFT), "Pollen not cancelable ");
    pollen.status.changePollen(PollenStatus.CANCELED, _tag);
    }

}
