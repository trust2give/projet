// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

// Librairie implémentant un journal de traçabilité des enregistrements

import "./LibNektarData.sol";


library LibNektarSts {

  bool constant YES = true;
  bool constant NO = false;

  using LibObjCard for ObjCard;
  using LibStatus for StatusLog;
  using LibErrors for *;
  using StringUtilsLib for *;
  using LibIdentifier for IdLog;
  using LibNektarData for NektarStorage;
  using LinkedListLib for LinkedListLib.LinkedList;

  function beacon_LibNektarSts() public pure returns (string memory) { return "LibNektarSts::1.0.1"; }

  // Good
  function isDraft(NektarStorage storage _self, bytes32 _id) external view returns (Nektar storage _nektar) {
    _nektar = _self.isNektar(_id);
    (NektarStatus current, , ) = _nektar.status.currentNektar();
    if (current != NektarStatus.DRAFT) revert("Nektar not editable");
    }

  /// @dev activate a specific registered NEKTAR with already DRAFT status
  /// @param _self stored NektarStorage structure that contains user object
  /// @param _id bytes32 of the NEKTAR to activate
  function certify( NektarStorage storage _self, bytes32 _id, string calldata _tag) external {
    Nektar storage nektar = _self.isNektar(_id);
    (NektarStatus current, , ) = nektar.status.currentNektar();
    if (current != NektarStatus.DRAFT) revert("Status Error"); 
    nektar.status.changeNektar(NektarStatus.CERTIFIED, _tag);
    }

  /// @dev eat a specific registered NEKTAR with already CERTIFIED status
  /// @param _self stored NektarStorage structure that contains user object
  /// @param _id bytes32 of the NEKTAR to close
  function eat( NektarStorage storage _self, bytes32 _id, string calldata _tag) external {
    Nektar storage nektar = _self.isNektar(_id);
    (NektarStatus current, , ) = nektar.status.currentNektar();
    if (current != NektarStatus.CERTIFIED) revert("Status Error"); 
    nektar.status.changeNektar(NektarStatus.EATEN, _tag);
    }

  /// @dev cancel a specific registered NEKTAR with already DRAFT status
  /// @param _self stored NektarStorage structure that contains user object
  /// @param _id bytes32 of the NEKTAR to close
  function cancel( NektarStorage storage _self, bytes32 _id, string calldata _tag) external {
    Nektar storage nektar = _self.isNektar(_id);
    (NektarStatus current, , ) = nektar.status.currentNektar();
    if (current != NektarStatus.DRAFT) revert("Status Error"); 
    nektar.status.changeNektar(NektarStatus.CANCELED, _tag);
    }

}
