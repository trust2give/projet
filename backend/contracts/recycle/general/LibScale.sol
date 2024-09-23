// SPDX-License-Identifier: UNLICENCED

/* Librairy LibScale - Version Remix Compiler 0.8.18 : 02/08/2023 Edition 1.0
 * @title Unit Scale library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente des fonctions de gestion des unités
 */

pragma solidity ^0.8.11;

/* Type UnitScale 
 * Défini les unités des mesures
 */

enum UnitScale {
  unit,       // Valeur 0 = 1000**0
  kilo,       // Valeur 1 = 1000**1
  tonne,      // Valeur 2 = 1000**2
  kilotonne,  // Valeur 3 = 1000**3
  megatonne   // Valeur 4 = 1000**4
}

struct scaleObj {
  uint256 stamp;
  string tag;
  UnitScale value;
  }

struct ScaleLog {
  uint256 nb;
  mapping(uint256 => scaleObj) scale;  
  }

/* Données de comptes */

library LibScale {

    function beacon_LibScale() public pure returns (string memory) { return "LibScale::1.0.0"; }

    function change(ScaleLog storage _self, UnitScale _scale, string memory _tag) public {
      _self.scale[++_self.nb].value = _scale;
      _self.scale[_self.nb].tag = _tag;
      _self.scale[_self.nb].stamp = block.timestamp;
      }

    function current(ScaleLog storage _self) public view returns (UnitScale _scale, uint256 _stamp, string memory _tag) {
      return (_self.scale[_self.nb].value, _self.scale[_self.nb].stamp, _self.scale[_self.nb].tag);
      }

    function previous(ScaleLog storage _self, uint _rank) public view returns (UnitScale _scale, uint256 _stamp, string memory _tag) {
      return (_self.scale[_rank].value, _self.scale[_rank].stamp, _self.scale[_rank].tag);
      }

    function sizeOf(ScaleLog storage _self) public view returns (uint256 _size) {
      return (_self.nb);
      }

    function convert2Unit( ScaleLog storage _self, uint256 _amount) view external returns (uint256 _converted) {
      if (_self.scale[_self.nb].value == UnitScale.unit) _converted = _amount;
      if (_self.scale[_self.nb].value == UnitScale.kilo) _converted = 1000 * _amount;
      if (_self.scale[_self.nb].value == UnitScale.tonne) _converted = 1000**2 * _amount;
      if (_self.scale[_self.nb].value == UnitScale.kilotonne) _converted = 1000**3 * _amount;      
      if (_self.scale[_self.nb].value == UnitScale.megatonne) _converted = 1000**4 * _amount;      
      }
    }