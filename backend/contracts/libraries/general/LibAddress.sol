// SPDX-License-Identifier: UNLICENCED

/* Librairy LibAddress - Version Remix Compiler 0.8.18 : 02/08/2023 Edition 1.0
 * @title Status library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente des fonctions de gestion d'un statut d'objet
 */

pragma solidity ^0.8.11;

struct addressObj {
  uint256 stamp;
  string tag;
  address id;
  }

struct AddressLog {
  uint256 nb;
  mapping(uint256 => addressObj) value;  
  }

/* Données de comptes */

library LibAddress {

    function beacon_LibAddress() public pure returns (string memory) { return "LibAddress::1.0.0"; }

    function create(AddressLog storage _self, address _id, string memory _tag) public {
      _self.value[++_self.nb].id = _id;
      _self.value[_self.nb].tag = _tag;
      _self.value[_self.nb].stamp = block.timestamp;
      }

    function current(AddressLog storage _self) public view returns (address _id, uint256 _stamp, string memory _tag) {
      return (_self.value[_self.nb].id, _self.value[_self.nb].stamp, _self.value[_self.nb].tag);
      }

    function previous(AddressLog storage _self, uint _rank) public view returns (address _id, uint256 _stamp, string memory _tag) {
      return (_self.value[_rank].id, _self.value[_rank].stamp, _self.value[_rank].tag);
      }

    function sizeOf(AddressLog storage _self) public view returns (uint256 _size) {
      return (_self.nb);
      }
    }