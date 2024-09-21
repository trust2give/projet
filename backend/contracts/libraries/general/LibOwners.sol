// SPDX-License-Identifier: UNLICENCED

/* Librairy LibOwners - Version Remix Compiler 0.8.18 : 02/08/2023 Edition 1.0
 * @title Owners  library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente des fonctions de gestion des identifiants des owner
 */

pragma solidity ^0.8.11;

/* Type ObjectOwner
 * Utilisé pour les objets de types Entité, Units, Users
 */

enum OwnerType {
  NONE,       // Etat transitoire par défault à la création d'un objet
  PERSON,
  ENTITY
  }

struct OwnerObj {
  uint256 stamp;
  string tag;
  bytes32 owner;
  OwnerType value;
  }

struct OwnerLog {
  uint256 nb;
  mapping(uint256 => OwnerObj) owner;  
  }

/* Données de comptes */

library LibOwners {

    event ownerChange(OwnerType _owner, bytes32 _id, string _tag, uint256 _stamp);

    function beacon_LibOwners() public pure returns (string memory) { return "LibOwners::1.0.0"; }

    function change(OwnerLog storage _self, OwnerType _owner, bytes32 _id, string memory _tag, uint256 _stamp) public {
      _self.owner[++_self.nb].value = _owner;
      _self.owner[_self.nb].tag = _tag;
      _self.owner[_self.nb].owner = _id;
      _self.owner[_self.nb].stamp = _stamp;
      emit ownerChange(_owner, _id, _tag, _stamp);
      }

    function newTag(OwnerLog storage _self, string memory _tag, uint256 _stamp) public {
      _self.owner[_self.nb + 1].value = _self.owner[_self.nb].value;
      _self.owner[_self.nb + 1].owner = _self.owner[_self.nb].owner;
      _self.owner[++_self.nb].tag = _tag;
      _self.owner[_self.nb].stamp = _stamp;
      }

    function current(OwnerLog storage _self) public view returns (OwnerType _owner, bytes32 _id, uint256 _stamp, string memory _tag) {
      return (_self.owner[_self.nb].value, _self.owner[_self.nb].owner, _self.owner[_self.nb].stamp, _self.owner[_self.nb].tag);
      }

    function previous(OwnerLog storage _self, uint _rank) public view returns (OwnerType _owner, bytes32 _id, uint256 _stamp, string memory _tag) {
      return (_self.owner[_rank].value, _self.owner[_rank].owner, _self.owner[_rank].stamp, _self.owner[_rank].tag);
      }

    function sizeOf(OwnerLog storage _self) public view returns (uint256 _size) {
      return (_self.nb);
      }
    }