// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

// Librairie implémentant un journal de traçabilité des enregistrements

import "../general/LibObjCard.sol";
import "../general/LibStatus.sol";
import "../general/LibScope.sol";
import "../general/LibTexts.sol";
import "../general/LibScale.sol";
import "../general/LibCurrency.sol";
import "../general/LibErrors.sol";
import "../general/LibAddress.sol";
import "../general/LibValue.sol";
import "../general/LibIdentifier.sol";
import "../utils/LinkedListLib.sol";

/* Type PeriodType
 * Définit les valeurs de période pour la configuration des trjectoires et des quotas
 * NONE : Valeur par défaut à l'initialisation de la variable
 * MONTH : Période mensuelle
 * QUARTER: Période trimestrielle
 * SEMESTER : Période semestrielle
 * YEAR : Période annuelle
 */

enum PeriodType {
  NONE,
  MONTH,
  QUARTER,
  SEMESTER,
  YEAR
  }

/* Type Crop
 * Structure qui décrit le contrat de trajectoire de base d'une entité E1
 */
struct Crop {
  ObjCard card;     // CROP Name, Author & logo
  IdLog id;         // Unique ID based on Parent / Period / Start Year / Index
  uint16 start;     // Starting year of the period
  uint8 periods;    // Valeur qui indique le nombre de périodes dans l'élongation calendaire de la trajectoire
  uint256 quota;    // Valeur indiquant le quota total maximum d'émission de GES cible pour l'entité
  uint256 gain;     // Valeur indiquant le gain total maximum d'émission de GES par rapport à la trajectoire As-Usual
  uint256[] period;
  PeriodType unit;  
  ScaleLog scale;   // Unit scale of numbers (GHG quantities)
  StatusLog status; // CROP lifecycle status
  }

struct CropStorage {
  uint256 nbCrops;  // Number of registered user (regardless status)
  mapping(uint256  => Crop) crop;
  mapping(bytes32 => uint256) cropIndex;
  mapping(bytes32 => LinkedListLib.LinkedList) cropFromUnit;  
  }

library LibCropData {
  using LibErrors for *;
  using LibObjCard for ObjCard;
  using StringUtilsLib for *;
  using LibIdentifier for IdLog;
  using LinkedListLib for LinkedListLib.LinkedList;
  using LibStatus for StatusLog;

  function beacon_LibCropData() public pure returns (string memory) { return "LibCropData::1.0.0"; }

  /// @dev check that a specific CROP is registered
  /// @param _self stored CropStorage structure that contains user objects
  /// @param _id @ETH address of the CROP to check
  /// @return bool true is @ID is valid otherwise revert error
  function isValid(CropStorage storage _self, bytes32 _id) public view returns (bool) {
    return LibErrors.registered( ((_self.nbCrops > 0) && (_self.cropIndex[_id.notNull( "CropId" )] > 0)), "isValid::Crop");
    }

  /// @dev check that a specific CROP is not registered
  /// @param _self stored CropStorage structure that contains user objects
  /// @param _id @ETH address of the CROP to check
  /// @return bool true is @ID is not registered otherwise revert error
  function isNotValid(CropStorage storage _self, bytes32 _id) public view returns (bool) {
    return LibErrors.notRegistered( ((_self.nbCrops > 0) && (_self.cropIndex[_id.notNull( "CropId" )] > 0)), "isNotValid::Crop");
    }

  /// @dev check if a specific CROP is registered or not
  /// @param _self stored CropStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @return _crop - the pointer to the CROP object, ptherwise revert error event
  function isCrop(CropStorage storage _self, bytes32 _id) public view returns (Crop storage _crop) {
    LibErrors.registered( ((_self.nbCrops > 0) && (_self.cropIndex[_id.notNull( "CropId" )] > 0)), "isCrop::Crop");
    _crop = _self.crop[_self.cropIndex[_id]];
    }

  /// @dev check if a specific CROP is registered or not
  /// @param _self stored CropStorage structure that contains user objects
  /// @param _name name of the CROP to get @ID
  /// @return _crop - the @ID to the CROP object, ptherwise revert error event
  function isCrop(CropStorage storage _self, string memory _name) public view returns (bytes32 _crop) {
    LibErrors.registered( (_self.nbCrops > 0), "isCrop::Crop");
    uint256 i = 1;
    while ((i < _self.nbCrops)) {
      (string memory name, , , ,  ) = _self.crop[i].card.current();
      if (name.toSlice().equals(_name.toSlice())) {
        (_crop, , ) = _self.crop[i].id.current();
        return _crop;
        }
      }
    revert( _name.toSlice().concat("::Entity Unknown".toSlice()) );
    }

  /// @dev return the total number of registered CROP
  /// @param _self stored CropStorage structure that contains user objects
  /// @return utin256 - the total number of registered CROP, regardless their status
  function counts(CropStorage storage _self) public view returns (uint256) { return (_self.nbCrops); }

  /// @dev returns the lsit of @ID for CROP related to a given unit and per status
  /// @param _self stored CropStorage structure that contains CROP objects
  /// @param _unit @ID of the unit to get CROP ID list
  /// @param _status status for the CROP (INIT => All status)
  /// @return _crops Array of @ID CROP
  function getCrops( CropStorage storage _self, bytes32 _unit, Status _status) public view returns (bytes32[] memory _crops) {
    _unit.notNull( "CropId" );
    LinkedListLib.LinkedList storage crops = _self.cropFromUnit[_unit];
    if (!crops.listExists()) revert("getCrops::No Crop List");
    uint256 size = crops.sizeOf();
    if (size == 0) revert("getCrops::Empty List"); 
    _crops = new bytes32[](size);
    uint256 ptr = 0;
    (bool exists, uint256 i) = crops.getAdjacent( LinkedListLib.HEAD, LinkedListLib.NEXT);
    while (i != LinkedListLib.HEAD) {
      (bytes32 id, , ) = _self.crop[i].id.current();
      (Status current, , ) = _self.crop[i].status.current();
      if (_status == Status.INIT || current == _status) {
        _crops[ptr++] = id;
        }
      (exists,i) = crops.getAdjacent( i, LinkedListLib.NEXT);
      }
    }
}
