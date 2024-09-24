// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

// Librairie implémentant un journal de traçabilité des enregistrements

import "./LibNektarData.sol";
import "../general/LibScope.sol";

library LibNektarBal {

  using LibObjCard for ObjCard;
  using LibTexts for TextLog;
  using LibStatus for StatusLog;
  using LibCurrency for CurrencyLog;
  using LibValue for ValueLog;
  using LibScale for ScaleLog;
  using LibScope for ScopeLog;
  using LibErrors for *;
  using StringUtilsLib for *;
  using LibIdentifier for IdLog;
  using LibNektarData for NektarStorage;
  using LinkedListLib for LinkedListLib.LinkedList;

  function beacon_LibNektarBal() public pure returns (string memory) { return "LibNektarBal::1.0.0"; }

  function balances( NektarStorage storage _self, bytes32 _unit, NektarStatus _status) 
  public view returns (uint256 _count, uint256 _tco, uint256 _total) {
    //uint8(_scale).notNone( "balances::Scale");

    LinkedListLib.LinkedList storage nektars = _self.nektarFromUnit[_unit];
    _count = nektars.sizeOf();
    if (nektars.listExists() && (_count > 0)) {
      uint256 index;
      bool valid;
      (valid, index) = nektars.getAdjacent( LinkedListLib.HEAD, LinkedListLib.NEXT);
      while (index != LinkedListLib.HEAD) {
        (NektarStatus current, , ) = _self.nektar[index].status.currentNektar();
        if (_status == NektarStatus.INIT || _status == current) {
          // we get the total amount for the selected nektar & convert to the scale required
          (uint256 total, , ) = _self.nektar[index].quantity.current();
          _total += _self.nektar[index].unit.convert2Unit( total );
          (uint256 tco, , ) = _self.nektar[index].tco.current();
          _tco += _self.nektar[index].currency.convert2euros( tco );
          }
        (valid, index) = nektars.getAdjacent( index, LinkedListLib.NEXT);
        }
      }
    }

  function balances( NektarStorage storage _self ) 
  public view returns (uint256 _nb, uint256 _total, uint256 _tco) {
    //uint8(_scale).notNone( "balances::Scale");
    //uint8(_currency).notNone( "balances::Currency");

    uint256 index = 1;
    _nb = _self.nbNektars;
    while (index <= _self.nbNektars) {
      (uint256 total, , ) = _self.nektar[index].quantity.current();
      (uint256 tco, , ) = _self.nektar[index].tco.current();
      _total += _self.nektar[index].unit.convert2Unit( total );
      _tco += _self.nektar[index].currency.convert2euros( tco );
      index++;
      }
    }
}
