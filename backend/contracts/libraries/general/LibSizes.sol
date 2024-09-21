// SPDX-License-Identifier: UNLICENCED

/* Librairy LibSizes - Version Remix Compiler 0.8.18 : 02/08/2023 Edition 1.0
 * @title Sizes library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente des fonctions de gestion d'un statut d'objet
 */

pragma solidity ^0.8.11;

/* Type UnitSize
 * Type utilisé pour la caractérisation la taille des unités dans la ruche
 */ 

enum UnitSize {
  NONE,   // Pas de type par défaul
  SOLE,   // Taille individuelle
  TPE,    // Taille < 10 personnes
  PME,    // Taille < 250 personnes
  ETI,    // Taille < 1000 personnes
  GE      // Taille > 1000 personnes
  }

struct sizeObj {
  uint256 stamp;
  string tag;
  UnitSize value;
  }

struct SizesLog {
  uint256 nb;
  mapping(uint256 => sizeObj) size;  
  }

/* Données de comptes */

library LibSizes {

    event sizeChange(UnitSize _new, string _tag, uint256 _stamp);

    function beacon_LibSizes() public pure returns (string memory) { return "LibSizes::1.0.0"; }

    function change(SizesLog storage _self, UnitSize _size, string memory _tag) public {
      _self.size[++_self.nb].value = _size;
      _self.size[_self.nb].tag = _tag;
      _self.size[_self.nb].stamp = block.timestamp;
      emit sizeChange(_size, _tag, _self.size[_self.nb].stamp);
      }

    function current(SizesLog storage _self) public view returns (UnitSize _size, uint256 _stamp, string memory _tag) {
      return (_self.size[_self.nb].value, _self.size[_self.nb].stamp, _self.size[_self.nb].tag);
      }

    function previous(SizesLog storage _self, uint _rank) public view returns (UnitSize _size, uint256 _stamp, string memory _tag) {
      return (_self.size[_rank].value, _self.size[_rank].stamp, _self.size[_rank].tag);
      }

    function sizeOf(SizesLog storage _self) public view returns (uint256 _size) {
      return (_self.nb);
      }
    }