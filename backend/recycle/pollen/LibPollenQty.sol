// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

// Librairie implémentant un journal de traçabilité des enregistrements

import "./LibPollenData.sol";
import "./LibPollenSts.sol";
import "../general/LibScope.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

library LibPollenQty {

  using LibValue for ValueLog;
  using LibScope for ScopeLog;
  using LibCurrency for CurrencyLog;
  using LibScale for ScaleLog;
  using LibErrors for *;
  using LibPollenData for PollenStorage;
  using LibPollenSts for PollenStorage;

  function beacon_LibPollenQty() public pure returns (string memory) { return "LibPollenQty::1.0.0"; }

  function updateScopes( PollenStorage storage _self, bytes32 _id, uint256[] memory _scope, UnitScale _scale, string memory _tag) 
    external returns (bytes32 _pollen) {
    _tag.notNull( "updateScopes::Tag");
    //uint8(_scale).notNone( "updateScopes::Scale");

    Pollen storage pollen = _self.isDraft(_id);
    if (_scope.length != (uint8(type(GainScope).max) + 1)) revert(string.concat("updateScopes::Array size ", Strings.toString(_scope.length)));
    uint256 total = 0;
    for (uint8 i = 1; i <= uint8(type(GainScope).max); i++) { total += _scope[i]; }
    pollen.scope.change( _scope, _tag );
    pollen.quantity.change( total, _tag);
    pollen.unit.change( _scale, _tag);
    _pollen = _id;
    }

  function getScopes( PollenStorage storage _self, bytes32 _id ) 
  public view returns (uint256[] memory _scope, uint256 _total, uint256 _tco, UnitScale _scale, Currency _currency) {
    Pollen storage pollen = _self.isPollen(_id);
    _scope = new uint256[](uint(type(GainScope).max));
    (_total, , ) = pollen.quantity.current();
    (_tco, , ) = pollen.tco.current();
    (_scale, , ) = pollen.unit.current();
    (_currency, , ) = pollen.currency.current();
    (_scope, , ) = pollen.scope.current();
    }

}
