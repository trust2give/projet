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

struct Cell {
  ObjCard card;  // CELL Name, Author & logo
  IdLog id;
  uint16 period;  // Period over which the Bilan Carbone is worked out
  ScaleLog unit; // Unit scale of numbers (GHG quantities)
  CurrencyLog currency; // currency of the TCO
  StatusLog status; // CELL lifecycle status
  ValueLog quantity; // Total quantity of GHG emissions as per Bilan Carbone for the period
  uint256 cells;        // nombre de cells associés au Cell
  mapping (uint256 => bytes32) cell;
  ValueLog tco;  // Total amount spent for implementing GHG reduction actions
  SourceLog  source;         // traçabilité de la source émettrice du gain
  }

struct CellStorage {
  uint256 nbCells;  // Number of registered user (regardless status)
  mapping(uint256  => Cell) cell;
  mapping(bytes32 => uint256) cellIndex;
  mapping(bytes32 => LinkedListLib.LinkedList) cellFromUnit;  
  }

library LibCellData {
  using LibErrors for *;
  using LibObjCard for ObjCard;
  using StringUtilsLib for *;
  using LibIdentifier for IdLog;
  using LinkedListLib for LinkedListLib.LinkedList;
  using LibStatus for StatusLog;

  function beacon_LibCellData() public pure returns (string memory) { return "LibCellData alive!"; }

  /// @dev check if a specific CELL is registered or not
  /// @param _self stored CellStorage structure that contains user objects
  /// @param _id @ETH address of the CELL to get features
  /// @return bool true is @ID is valid
  function isValid(CellStorage storage _self, bytes32 _id) public view returns (bool) {
    return LibErrors.registered( ((_self.nbCells > 0) && (_self.cellIndex[_id.notNull( "CellId" )] > 0)), "isValid::Cell");
    }

  /// @dev check if a specific CELL is registered or not
  /// @param _self stored CellStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @return _cell - the pointer to the CELL object, ptherwise revert error event
  function isCell(CellStorage storage _self, bytes32 _id) public view returns (Cell storage _cell) {
    LibErrors.registered( ((_self.nbCells > 0) && (_self.cellIndex[_id.notNull( "CellId" )] > 0)), "isCell::Cell");
    _cell = _self.cell[_self.cellIndex[_id]];
    }

  /// @dev check if a specific CELL is registered or not
  /// @param _self stored CellStorage structure that contains user objects
  /// @param _name name of the CELL to get @ID
  /// @return _cell - the @ID to the CELL object, ptherwise revert error event
  function isCell(CellStorage storage _self, string memory _name) public view returns (bytes32 _cell) {
    LibErrors.registered( (_self.nbCells > 0), "isCell::Cell");
    uint256 i = 1;
    while ((i < _self.nbCells)) {
      (string memory name, , , , ) = _self.cell[i].card.current();
      if (name.toSlice().equals(_name.toSlice())) {
        (_cell, , ) = _self.cell[i].id.current();
        return _cell;
        }
      }
    revert( _name.toSlice().concat("::Entity Unknown".toSlice()) );
    }

  /// @dev return the total number of registered CELL
  /// @param _self stored CellStorage structure that contains user objects
  /// @return utin256 - the total number of registered CELL, regardless their status
  function counts(CellStorage storage _self) public view returns (uint256) { return (_self.nbCells); }

  /// @dev returns the lsit of @ID for CELL related to a given unit and per status
  /// @param _self stored CellStorage structure that contains CELL objects
  /// @param _unit @ID of the unit to get CELL ID list
  /// @param _status status for the CELL (INIT => All status)
  /// @return _valid bool to check the validity of the returned list
  /// @return _cells Array of @ID CELL
  function getCells( CellStorage storage _self, bytes32 _unit, CellStatus _status) public view returns (bool _valid, bytes32[] memory _cells) {
    _valid = false;
    _unit.notNull( "CellId" );
    LinkedListLib.LinkedList storage cells = _self.cellFromUnit[_unit];
    if (cells.listExists()) {
      uint256 size = cells.sizeOf();
      if (size > 0) {
        _cells = new bytes32[](size);
        uint256 ptr = 0;
        (bool exists, uint256 i) = cells.getAdjacent( LinkedListLib.HEAD, LinkedListLib.NEXT);
        while (i != LinkedListLib.HEAD) {
          (bytes32 id, , ) = _self.cell[i].id.current();
          (CellStatus current, , ) = _self.cell[i].status.currentCell();
          if (_status == CellStatus.INIT || current == _status) {
            _cells[ptr++] = id;
            }
          (exists,i) = cells.getAdjacent( i, LinkedListLib.NEXT);
          }
        }
      }

    }
}
