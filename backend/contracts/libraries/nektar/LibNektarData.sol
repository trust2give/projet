// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

// Librairie implémentant un journal de traçabilité des enregistrements

import "../general/LibObjCard.sol";
import "../general/LibStatus.sol";
import "../general/LibSources.sol";
import "../general/LibScale.sol";
import "../general/LibCurrency.sol";
import "../general/LibErrors.sol";
import "../general/LibValue.sol";
import "../general/LibIdentifier.sol";
import "../utils/LinkedListLib.sol";

struct Nektar {
  ObjCard card;  // NEKTAR Name, Author & logo & Parent
  IdLog id;
  ScaleLog unit; // Unit scale of numbers (GHG quantities)
  CurrencyLog currency; // currency of the TCO
  SourceLog  source;         // traçabilité de la source émettrice du gain
  uint16 period;  // Period over which the Bilan Carbone is worked out
  uint16 start;   // Starting date of the period
  StatusLog status; // NEKTAR lifecycle status
  ValueLog quantity; // Total quantity of GHG emissions as per Bilan Carbone for the period
  ValueLog tco;  // Total amount spent for implementing GHG reduction actions
  uint256 pollens;        // nombre de nektars associés au Nektar
  mapping (uint256 => bytes32) pollen;
  }

struct NektarStorage {
  uint256 nbNektars;  // Number of registered user (regardless status)
  mapping(uint256  => Nektar) nektar;
  mapping(bytes32 => uint256) nektarIndex;
  mapping(bytes32 => LinkedListLib.LinkedList) nektarFromUnit;  
  }

library LibNektarData {
  using LibErrors for *;
  using LibObjCard for ObjCard;
  using StringUtilsLib for *;
  using LibIdentifier for IdLog;
  using LinkedListLib for LinkedListLib.LinkedList;
  using LibStatus for StatusLog;

  function beacon_LibNektarData() public pure returns (string memory) { return "LibNektarData::1.0.0"; }

  /// @dev check if a specific NEKTAR is registered or not
  /// @param _self stored NektarStorage structure that contains user objects
  /// @param _id @ETH address of the NEKTAR to get features
  /// @return bool true is @ID is valid
  function isValid(NektarStorage storage _self, bytes32 _id) public view returns (bool) {
    return LibErrors.registered( ((_self.nbNektars > 0) && (_self.nektarIndex[_id.notNull( "NektarId" )] > 0)), "isValid::Nektar");
    }

  /// @dev check that a specific NEKTAR is not registered
  /// @param _self stored NektarStorage structure that contains user objects
  /// @param _id @ETH address of the NEKTAR to check
  /// @return bool true is @ID is not registered otherwise revert error
  function isNotValid(NektarStorage storage _self, bytes32 _id) public view returns (bool) {
    return LibErrors.notRegistered( ((_self.nbNektars > 0) && (_self.nektarIndex[_id.notNull( "NektarId" )] > 0)), "isNotValid::Nektar");
    }

  /// @dev check if a specific NEKTAR is registered or not
  /// @param _self stored NektarStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @return _nektar - the pointer to the NEKTAR object, ptherwise revert error event
  function isNektar(NektarStorage storage _self, bytes32 _id) public view returns (Nektar storage _nektar) {
    LibErrors.registered( ((_self.nbNektars > 0) && (_self.nektarIndex[_id.notNull( "NektarId" )] > 0)), "isNektar::Nektar");
    _nektar = _self.nektar[_self.nektarIndex[_id]];
    }

  /// @dev check if a specific NEKTAR is registered or not
  /// @param _self stored NektarStorage structure that contains user objects
  /// @param _name name of the NEKTAR to get @ID
  /// @return _nektar - the @ID to the NEKTAR object, ptherwise revert error event
  function isNektar(NektarStorage storage _self, string memory _name) public view returns (bytes32 _nektar) {
    LibErrors.registered( (_self.nbNektars > 0), "isNektar::Nektar");
    uint256 i = 1;
    while ((i < _self.nbNektars)) {
      (string memory name, , , , ) = _self.nektar[i].card.current();
      if (name.toSlice().equals(_name.toSlice())) {
        (_nektar, , ) = _self.nektar[i].id.current();
        return _nektar;
        }
      }
    revert( _name.toSlice().concat("::Entity Unknown".toSlice()) );
    }

  /// @dev return the total number of registered NEKTAR
  /// @param _self stored NektarStorage structure that contains user objects
  /// @return utin256 - the total number of registered NEKTAR, regardless their status
  function counts(NektarStorage storage _self) public view returns (uint256) { return (_self.nbNektars); }

  /// @dev returns the lsit of @ID for NEKTAR related to a given unit and per status
  /// @param _self stored NektarStorage structure that contains NEKTAR objects
  /// @param _unit @ID of the unit to get NEKTAR ID list
  /// @param _status status for the NEKTAR (INIT => All status)
  /// @return _nektars Array of @ID NEKTAR
  function getNektars( NektarStorage storage _self, bytes32 _unit, NektarStatus _status) external view returns (bytes32[] memory _nektars) {
    _unit.notNull( "getNektars::NektarId" );
    LinkedListLib.LinkedList storage nektars = _self.nektarFromUnit[_unit];
    if (!nektars.listExists()) revert("getNektars::No Nektar List");
    uint256 size = nektars.sizeOf();
    if (size == 0) revert("getNektars::Empty List"); 
    _nektars = new bytes32[](size);
    uint256 ptr = 0;
    (bool exists, uint256 i) = nektars.getAdjacent( LinkedListLib.HEAD, LinkedListLib.NEXT);
    while (i != LinkedListLib.HEAD) {
      (bytes32 id, , ) = _self.nektar[i].id.current();
      (NektarStatus current, , ) = _self.nektar[i].status.currentNektar();
      if (_status == NektarStatus.INIT || current == _status) {
        _nektars[ptr++] = id;
        }
      (exists,i) = nektars.getAdjacent( i, LinkedListLib.NEXT);
      }
    }
}
