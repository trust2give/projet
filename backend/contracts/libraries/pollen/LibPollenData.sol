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

/* Type Pollen
 * Défini la structure d'un Token POLLEN dans la ruche
 * Un POLLEN correspond à l'enregistrement d'un Bilan Carbone (ADEME ou GHG Protocol)
 * Il ne peut y avoir deux pollens ayant le même index / parent / periode / start year.
 */
struct Pollen {
  ObjCard card;  // POLLEN Name, Author & logo
  IdLog id;       // Unique ID based on Parent / Period / Start Year / Index
  uint16 period;  // Period over which the Bilan Carbone is worked out
  uint16 start;   // Starting year of the period
  uint16 index;   // current pollen index within the period
  ScaleLog unit; // Unit scale of numbers (GHG quantities)
  CurrencyLog currency; // currency of the TCO
  StatusLog status; // POLLEN lifecycle status
  TextLog document; // IPFS Name & Path of the related "Bilan Carbone"
  ValueLog quantity; // Total quantity of GHG emissions as per Bilan Carbone for the period
  ScopeLog scope; // Breakdown of GHG emissions per scope
  ValueLog tco;  // Total amount spent for implementing GHG reduction actions
  }

struct PollenStorage {
  uint256 nbPollens;  // Number of registered user (regardless status)
  mapping(uint256  => Pollen) pollen;
  mapping(bytes32 => uint256) pollenIndex;
  mapping(bytes32 => LinkedListLib.LinkedList) pollenFromUnit;  
  }

library LibPollenData {
  using LibErrors for *;
  using LibObjCard for ObjCard;
  using StringUtilsLib for *;
  using LibIdentifier for IdLog;
  using LinkedListLib for LinkedListLib.LinkedList;
  using LibStatus for StatusLog;

  function beacon_LibPollenData() public pure returns (string memory) { return "LibPollenData::1.0.0"; }

  /// @dev check that a specific POLLEN is registered
  /// @param _self stored PollenStorage structure that contains user objects
  /// @param _id @ETH address of the POLLEN to check
  /// @return bool true is @ID is valid otherwise revert error
  function isValid(PollenStorage storage _self, bytes32 _id) public view returns (bool) {
    return LibErrors.registered( ((_self.nbPollens > 0) && (_self.pollenIndex[_id.notNull( "PollenId" )] > 0)), "isValid::Pollen");
    }

  /// @dev check that a specific POLLEN is not registered
  /// @param _self stored PollenStorage structure that contains user objects
  /// @param _id @ETH address of the POLLEN to check
  /// @return bool true is @ID is not registered otherwise revert error
  function isNotValid(PollenStorage storage _self, bytes32 _id) public view returns (bool) {
    return LibErrors.notRegistered( ((_self.nbPollens > 0) && (_self.pollenIndex[_id.notNull( "PollenId" )] > 0)), "isNotValid::Pollen");
    }

  /// @dev check if a specific POLLEN is registered or not
  /// @param _self stored PollenStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @return _pollen - the pointer to the POLLEN object, ptherwise revert error event
  function isPollen(PollenStorage storage _self, bytes32 _id) public view returns (Pollen storage _pollen) {
    LibErrors.registered( ((_self.nbPollens > 0) && (_self.pollenIndex[_id.notNull( "PollenId" )] > 0)), "isPollen::Pollen");
    _pollen = _self.pollen[_self.pollenIndex[_id]];
    }

  /// @dev check if a specific POLLEN is registered or not
  /// @param _self stored PollenStorage structure that contains user objects
  /// @param _name name of the POLLEN to get @ID
  /// @return _pollen - the @ID to the POLLEN object, ptherwise revert error event
  function isPollen(PollenStorage storage _self, string memory _name) public view returns (bytes32 _pollen) {
    LibErrors.registered( (_self.nbPollens > 0), "isPollen::Pollen");
    uint256 i = 1;
    while ((i < _self.nbPollens)) {
      (string memory name, , , ,  ) = _self.pollen[i].card.current();
      if (name.toSlice().equals(_name.toSlice())) {
        (_pollen, , ) = _self.pollen[i].id.current();
        return _pollen;
        }
      }
    revert( _name.toSlice().concat("::Entity Unknown".toSlice()) );
    }

  /// @dev return the total number of registered POLLEN
  /// @param _self stored PollenStorage structure that contains user objects
  /// @return utin256 - the total number of registered POLLEN, regardless their status
  function counts(PollenStorage storage _self) public view returns (uint256) { return (_self.nbPollens); }

  /// @dev returns the lsit of @ID for POLLEN related to a given unit and per status
  /// @param _self stored PollenStorage structure that contains POLLEN objects
  /// @param _unit @ID of the unit to get POLLEN ID list
  /// @param _status status for the POLLEN (INIT => All status)
  /// @return _pollens Array of @ID POLLEN
  function getPollens( PollenStorage storage _self, bytes32 _unit, PollenStatus _status) public view returns (bytes32[] memory _pollens) {
    _unit.notNull( "PollenId" );
    LinkedListLib.LinkedList storage pollens = _self.pollenFromUnit[_unit];
    if (!pollens.listExists()) revert("getPollens::No Pollen List");
    uint256 size = pollens.sizeOf();
    if (size == 0) revert("getPollens::Empty List"); 
    _pollens = new bytes32[](size);
    uint256 ptr = 0;
    (bool exists, uint256 i) = pollens.getAdjacent( LinkedListLib.HEAD, LinkedListLib.NEXT);
    while (i != LinkedListLib.HEAD) {
      (bytes32 id, , ) = _self.pollen[i].id.current();
      (PollenStatus current, , ) = _self.pollen[i].status.currentPollen();
      if (_status == PollenStatus.INIT || current == _status) {
        _pollens[ptr++] = id;
        }
      (exists,i) = pollens.getAdjacent( i, LinkedListLib.NEXT);
      }
    }
}
