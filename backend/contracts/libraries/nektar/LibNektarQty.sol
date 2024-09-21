// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

// Librairie implémentant un journal de traçabilité des enregistrements - NON UTILISEE

import "./LibNektarData.sol";
import "./LibNektarSts.sol";
import "../general/LibScope.sol";

library LibNektarQty {

  using LibValue for ValueLog;
  using LibScope for ScopeLog;
  using LibCurrency for CurrencyLog;
  using LibScale for ScaleLog;
  using LibErrors for *;
  using LibNektarData for NektarStorage;
  using LibNektarSts for NektarStorage;

  function beacon_LibNektarQty() public pure returns (string memory) { return "LibNektarQty::1.0.0"; }

  function pollenRank(Nektar storage _self, bytes32 _pollen) internal view returns (uint256) {
    for (uint256 i = 1; i <= _self.pollens; i++ ) {
      if (_self.pollen[i] == _pollen) return (i);
      }
    return 0;
    }

  /// @dev bind a new POLLEN to a specific NEKTAR.
  /// @param _self stored NektarStorage structure that contains objects
  /// @param _nektar @ID address of the NEKTAR to get features
  /// @param _pollen @ID address of the POLLEN to bind
  /// @param _value GHG emission value related to the POLLEN to bind (Scale Unit to be UnitScale.UNIT first). No conversion
  /// @param _tco value of the TCO related to the POLLEN to bind (Currency to be converted in Currency.EURO first). No conversion
  /// @param _tag string tag of the change
  function addPollen( NektarStorage storage _self, bytes32 _nektar, bytes32 _pollen, uint256 _value, uint256 _tco, string memory _tag) 
    external {
    _tag.notNull( "addPollen::Tag");
    _pollen.notNull( "addPollen::Pollen");
    _value.notNone( "addPollen::Value");
    _tco.notNone( "addPollen::TCO");

    Nektar storage nektar = _self.isDraft(_nektar);
    if (pollenRank( nektar, _pollen ) > 0) revert("addPollen::Pollen already bound");
    nektar.pollens++;
    nektar.pollen[nektar.pollens] = _pollen;
    (uint256 value, , ) = nektar.quantity.current();
    (uint256 tco, , ) = nektar.tco.current();
    nektar.quantity.change( value + _value, _tag );
    nektar.tco.change( tco + _tco, _tag );
    }

  /// @dev Unbind a POLLEN to a specific NEKTAR.
  /// @param _self stored NektarStorage structure that contains objects
  /// @param _nektar @ID address of the NEKTAR to get features
  /// @param _pollen @ID address of the POLLEN to unbind
  /// @param _value GHG emission value related to the POLLEN to unbind (Scale Unit to be UnitScale.UNIT first). No conversion
  /// @param _tco value of the TCO related to the POLLEN to unbind (Currency to be converted in Currency.EURO first). No conversion
  /// @param _tag string tag of the change
  function removePollen( NektarStorage storage _self, bytes32 _nektar, bytes32 _pollen, uint256 _value, uint256 _tco, string memory _tag) 
    external {
    _tag.notNull( "addPollen::Tag");
    _pollen.notNull( "addPollen::Pollen");
    _value.notNone( "addPollen::Value");
    _tco.notNone( "addPollen::TCO");

    Nektar storage nektar = _self.isDraft(_nektar);
    uint256 rank = pollenRank( nektar, _pollen );
    if (rank == 0) revert("addPollen::Pollen not bound");
    if (rank < nektar.pollens) nektar.pollen[rank] = nektar.pollen[nektar.pollens];
    delete nektar.pollen[nektar.pollens];
    nektar.pollens--;
    (uint256 value, , ) = nektar.quantity.current();
    (uint256 tco, , ) = nektar.tco.current();
    nektar.quantity.change( value - _value, _tag );
    nektar.tco.change( tco - _tco, _tag );
    }

}
