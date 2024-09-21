// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

// Librairie implémentant un journal de traçabilité des enregistrements

import "./LibCropData.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


library LibCropSts {

  bool constant YES = true;
  bool constant NO = false;

  using LibObjCard for ObjCard;
  using LibStatus for StatusLog;
  using LibErrors for *;
  using StringUtilsLib for *;
  using LibIdentifier for IdLog;
  using LibCropData for CropStorage;
  using LinkedListLib for LinkedListLib.LinkedList;

  // Version 1.0.1 : Create lib
  function beacon_LibCropSts() public pure returns (string memory) { return "LibCropSts::1.0.1"; }

  function isDraft(CropStorage storage _self, bytes32 _id) external view returns (Crop storage _crop) {
    _crop = _self.isCrop(_id);
    (Status current, , ) = _crop.status.current();
    require ((current == Status.DRAFT), "Crop not editable ");
    }

  function isActive(CropStorage storage _self, bytes32 _id) external view returns (Crop storage _crop) {
    _crop = _self.isCrop(_id);
    (Status current, , ) = _crop.status.current();
    require ((current == Status.ACTIVE), "Crop not active ");
    }

  /// @dev activate a specific registered CROP with already DRAFT or FROZEN status
  /// @param _self stored CropStorage structure that contains user object
  /// @param _id bytes32 of the CROP to activate
  function activate( CropStorage storage _self, bytes32 _id, string calldata _tag) external {
    Crop storage crop = _self.isCrop(_id);
    (Status current, , ) = crop.status.current();
    require ((current == Status.DRAFT || current == Status.FROZEN), "Crop status Error"); 
    crop.status.change(Status.ACTIVE, _tag);
    }

  /// @dev freeze a specific registered CROP with already not CLOSED status
  /// @param _self stored CropStorage structure that contains user object
  /// @param _id bytes32 of the CROP to close
  function freeze( CropStorage storage _self, bytes32 _id, string calldata _tag) external {
    Crop storage crop = _self.isCrop(_id);
    (Status current, , ) = crop.status.current();
    require ((current != Status.CLOSED), "Crop already closed");
    crop.status.change(Status.FROZEN, _tag);
    }

  /// @dev cancel a specific registered CROP
  /// @param _self stored CropStorage structure that contains user object
  /// @param _id bytes32 of the CROP to close
  function cancel( CropStorage storage _self, bytes32 _id, string calldata _tag) external {
    Crop storage crop = _self.isCrop(_id);
    crop.status.change(Status.CLOSED, _tag);
    }

}
