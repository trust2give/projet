// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

// Librairie implémentant un journal de traçabilité des enregistrements

import "./LibPollenData.sol";
import "../general/LibScope.sol";

library LibPollenBal {

  using LibObjCard for ObjCard;
  using LibAddress for AddressLog;
  using LibTexts for TextLog;
  using LibStatus for StatusLog;
  using LibCurrency for CurrencyLog;
  using LibValue for ValueLog;
  using LibScale for ScaleLog;
  using LibScope for ScopeLog;
  using LibErrors for *;
  using StringUtilsLib for *;
  using LibIdentifier for IdLog;
  using LibPollenData for PollenStorage;
  using LinkedListLib for LinkedListLib.LinkedList;

  // Version 1.0.1 : Test bug balances
  // Version 1.0.2 : bug fixing balances
  function beacon_LibPollenBal() public pure returns (string memory) { return "LibPollenBal::1.0.2"; }

  function balances( PollenStorage storage _self, bytes32 _unit, PollenStatus _status) 
  external view returns (uint256[] memory _scope, uint256 _pollens, uint256 _total) {
    //uint8(_scale).notNone( "balances::Scale");

    LinkedListLib.LinkedList storage pollens = _self.pollenFromUnit[_unit];
    if (pollens.listExists() && (pollens.sizeOf() > 0)) {
      uint256 index;
      bool valid;
      _scope = new uint256[](uint(type(GainScope).max) + 1);

      (valid, index) = pollens.getAdjacent( LinkedListLib.HEAD, LinkedListLib.NEXT);
      while (index != LinkedListLib.HEAD) {
        (PollenStatus current, , ) = _self.pollen[index].status.currentPollen();
        if (_status == PollenStatus.INIT || _status == current) {
          _pollens++;

          // we get the total amount for the selected pollen & convert to the scale required

          (uint256 total, , ) = _self.pollen[index].quantity.current();
          _total += _self.pollen[index].unit.convert2Unit( total );

          (uint256[] memory value, , ) = _self.pollen[index].scope.current();

          // we get the GHG quantities per scope for the selected pollen & convert to the currency required

          for (uint8 scope = uint8(type(GainScope).min); scope <= uint8(type(GainScope).max) ; scope++ ) {
            _scope[scope] += _self.pollen[index].unit.convert2Unit( value[scope] );
            }
          }
        (valid, index) = pollens.getAdjacent( index, LinkedListLib.NEXT);
        }
      }
    }

  /// @dev Get de TCO value for a given UNIT and per currency
  /// @param _self PollenStorage Object
  /// @param _unit @ID of the UNIT to scan
  /// @param _status status of POLLEN to check (INIT = All status)
  /// @return _tco Total TCO value for the UNIT per Currency (Array[Currency])
  /// @return _pollens Number of POLLENS for GHG value for the UNIT
  function readTco( PollenStorage storage _self, bytes32 _unit, PollenStatus _status) 
  external view returns (uint256[] memory _tco, uint256 _pollens) {
    //uint8(_currency).notNone( "balances::Currency");

    LinkedListLib.LinkedList storage pollens = _self.pollenFromUnit[_unit];
    if (pollens.listExists() && (pollens.sizeOf() > 0)) {
      uint256 index;
      bool valid;
      _tco = new uint256[](uint(type(Currency).max));

      (valid, index) = pollens.getAdjacent( LinkedListLib.HEAD, LinkedListLib.NEXT);
      while (index != LinkedListLib.HEAD) {
        (PollenStatus current, , ) = _self.pollen[index].status.currentPollen();
        if (_status == PollenStatus.INIT || _status == current) {
          _pollens++;
          // we get the tco amount for the selected pollen & convert to the currency required
          (uint256 tco, , ) = _self.pollen[index].tco.current();
          (Currency unit, , ) = _self.pollen[index].currency.current();
          _tco[uint256(unit)] += tco;
          // we get the GHG quantities per scope for the selected pollen & convert to the currency required
          }
        (valid, index) = pollens.getAdjacent( index, LinkedListLib.NEXT);
        }
      }
    }

  function balances( PollenStorage storage _self ) 
  external view returns (uint256[] memory _scope, uint256 _total, uint256[] memory _tco, uint256 _pollens) {
    //uint8(_scale).notNone( "balances::Scale");
    //uint8(_currency).notNone( "balances::Currency");

    uint256 index = 1;
    _scope = new uint256[](uint(type(GainScope).max) + 1);
    _tco = new uint256[](uint(type(Currency).max) + 1);
    while (index <= _self.nbPollens) {
      (uint256 total, , ) = _self.pollen[index].quantity.current();
      (uint256 tco, , ) = _self.pollen[index].tco.current();
      (Currency unit, , ) = _self.pollen[index].currency.current();
      (uint256[] memory value, , ) = _self.pollen[index].scope.current();
      _pollens++;

      for (uint8 scope = uint8(type(GainScope).min); scope <= uint8(type(GainScope).max) ; scope++ ) {
        _scope[scope] += _self.pollen[index].unit.convert2Unit( value[scope] );
        }
      _total += _self.pollen[index].unit.convert2Unit( total );
      _tco[uint256(unit)] += tco;
      index++;
      }
    }
}
