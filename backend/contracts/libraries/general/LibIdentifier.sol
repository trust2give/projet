// SPDX-License-Identifier: UNLICENCED

/* Librairy LibIdentifier - Version Remix Compiler 0.8.18 : 02/08/2023 Edition 1.0
 * @title Status library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente des fonctions de gestion d'un statut d'objet
 */

pragma solidity ^0.8.11;

/* Type ObjectStatus 
 * Utilisé pour les objets de types Entité, Units, Users
 */

enum Identity {
  NONE,       // Etat transitoire par défault à la création d'un objet
  USER,
  ENTITY,
  UNIT,
  POLLEN,
  NEKTAR,
  HONEY,
  CELL,
  CROP
  }

struct idObj {
  uint256 stamp;
  string tag;
  bytes32 id;
  Identity value;
  }

struct IdLog {
  uint256 nb;
  mapping(uint256 => idObj) identity;  
  }

/* Données de comptes */

library LibIdentifier {
    // Version 1.0.0 : lib creation
    // Version 1.0.1 : Added CROP value to Indentity
    function beacon_LibIdentifier() public pure returns (string memory) { return "LibIdentifier::1.0.1"; }

    function test(Identity _id, string memory _tag) public pure returns (bytes32 _newId) {
      return keccak256( abi.encodePacked( _tag, _id ));
      }


    function create(IdLog storage _self, Identity _id, string memory _tag) public returns (bytes32 _newId) {
      _newId = keccak256( abi.encodePacked( _tag, _id ));
      _self.identity[++_self.nb].id = _newId;
      _self.identity[_self.nb].value = _id;
      _self.identity[_self.nb].tag = _tag;
      _self.identity[_self.nb].stamp = block.timestamp;
      }

    function change(IdLog storage _self, Identity _id, bytes32 _value, string memory _tag) public {
      _self.identity[++_self.nb].id = _value;
      _self.identity[_self.nb].value = _id;
      _self.identity[_self.nb].tag = _tag;
      _self.identity[_self.nb].stamp = block.timestamp;
      }

    function current(IdLog storage _self) public view returns (bytes32 _id, uint256 _stamp, string memory _tag) {
      return (_self.identity[_self.nb].id, _self.identity[_self.nb].stamp, _self.identity[_self.nb].tag);
      }

    function previous(IdLog storage _self, uint _rank) public view returns (Identity _id, uint256 _stamp, string memory _tag) {
      return (_self.identity[_rank].value, _self.identity[_rank].stamp, _self.identity[_rank].tag);
      }

    function sizeOf(IdLog storage _self) public view returns (uint256 _size) {
      return (_self.nb);
      }
    }