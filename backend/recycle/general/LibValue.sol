// SPDX-License-Identifier: UNLICENCED

/* Librairy LibValue - Version Remix Compiler 0.8.18 : 02/08/2023 Edition 1.0
 * @title Value unit256 library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente des fonctions de gestion d'un type d'objet uint256
 */

pragma solidity ^0.8.11;

struct valueObj {
  uint256 stamp;
  string tag;
  uint256 value;
  }

struct ValueLog {
  uint256 nb;
  mapping(uint256 => valueObj) value;  
  }

/* Données de comptes */

library LibValue {

  function beacon_LibValue() public pure returns (string memory) { return "LibValue::1.0.0"; }

    function change(ValueLog storage _self, uint256 _value, string memory _tag) public {
      _self.value[++_self.nb].value = _value;
      _self.value[_self.nb].tag = _tag;
      _self.value[_self.nb].stamp = block.timestamp;
      }

    function current(ValueLog storage _self) public view returns (uint256 _value, uint256 _stamp, string memory _tag) {
      return (_self.value[_self.nb].value, _self.value[_self.nb].stamp, _self.value[_self.nb].tag);
      }

    function previous(ValueLog storage _self, uint _rank) public view returns (uint256 _value, uint256 _stamp, string memory _tag) {
      return (_self.value[_rank].value, _self.value[_rank].stamp, _self.value[_rank].tag);
      }

    function sizeOf(ValueLog storage _self) public view returns (uint256 _size) {
      return (_self.nb);
      }
    }