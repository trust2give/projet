// SPDX-License-Identifier: UNLICENCED

/* Librairy LibEntity - Version Remix Compiler 0.8.18 : 02/08/2023 Edition 1.0
 * @title Entity library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente des fonctions de gestion de type d'entité
 */

pragma solidity ^0.8.11;

/* Type EntityType
 * Type utilisé pour la caractérisation des entités autour de la ruche
 */ 
enum EntityType {
  NONE,     // Pas de type par défaul
  PERSON,   // Entité de type Personne Physique individuelle
  ENTITY,   // Entité de type Personne Morale individuelle
  GROUP,    // Entité de type Groupe de société
  NETWORK   // Entité de type Association / réseau de d"entités indépendantes
}

/* Type UnitType
 * Type utilisé pour la caractérisation la taille des unités dans la ruche
 */ 
enum UnitType {
  NONE,   // Pas de type par défaul
  ENTREPRISE,
  ASSOCIATION,
  FONDATION,
  PLATEFORME,
  COLLECTIVITE,
  EPICS,
  ETAT
  }

struct entityObj {
  uint256 stamp;
  string tag;
  EntityType entity;
  UnitType unit;
  }

struct EntityLog {
  uint256 nb;
  mapping(uint256 => entityObj) entity;  
  }

/* Données de comptes */

library LibEntity {

    function beacon_LibEntity() public pure returns (string memory) { return "LibEntity::1.0.0"; }

    function change(EntityLog storage _self, EntityType _entity, UnitType _unit, string memory _tag) public {
      _self.entity[++_self.nb].entity = _entity;
      _self.entity[_self.nb].unit = _unit;
      _self.entity[_self.nb].tag = _tag;
      _self.entity[_self.nb].stamp = block.timestamp;
      }

    function current(EntityLog storage _self) public view returns (EntityType _entity, UnitType _unit, uint256 _stamp, string memory _tag) {
      return (_self.entity[_self.nb].entity, _self.entity[_self.nb].unit, _self.entity[_self.nb].stamp, _self.entity[_self.nb].tag);
      }

    function previous(EntityLog storage _self, uint _rank) public view returns (EntityType _entity, UnitType _unit, uint256 _stamp, string memory _tag) {
      return (_self.entity[_rank].entity, _self.entity[_rank].unit, _self.entity[_rank].stamp, _self.entity[_rank].tag);
      }

    function sizeOf(EntityLog storage _self) public view returns (uint256 _size) {
      return (_self.nb);
      }
    }