// SPDX-License-Identifier: UNLICENCED

/* Librairy LibSector - Version Remix Compiler 0.8.18 : 02/08/2023 Edition 1.0
 * @title Status library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente des fonctions de gestion d'un statut d'objet
 */

pragma solidity ^0.8.11;

/* Type BusSector
 * Type utilisé pour la caractérisation du secteur d'activité de l'unité
 */ 
enum BusSector {
  NONE,
  TRANSPORT,
  AUTOMOTIVE,
  AEROSPACE,
  SERVICES,
  SOFTWARE,
  ITINDUSTRY,
  HIGHTECH,
  LUXURY,
  BUILDINGS,
  SUPPLYCHAIN,
  FOOD,
  HEALTHCARE
  }

struct sectorObj {
  uint256 stamp;
  string tag;
  BusSector value;
  }

struct SectorLog {
  uint256 nb;
  mapping(uint256 => sectorObj) sector;  
  }

/* Données de comptes */

library LibSector {

    function beacon_LibSector() public pure returns (string memory) { return "LibSector::1.0.0"; }

    function change(SectorLog storage _self, BusSector _sector, string memory _tag) public {
      _self.sector[++_self.nb].value = _sector;
      _self.sector[_self.nb].tag = _tag;
      _self.sector[_self.nb].stamp = block.timestamp;
      }

    function current(SectorLog storage _self) public view returns (BusSector _sector, uint256 _stamp, string memory _tag) {
      return (_self.sector[_self.nb].value, _self.sector[_self.nb].stamp, _self.sector[_self.nb].tag);
      }

    function previous(SectorLog storage _self, uint _rank) public view returns (BusSector _sector, uint256 _stamp, string memory _tag) {
      return (_self.sector[_rank].value, _self.sector[_rank].stamp, _self.sector[_rank].tag);
      }

    function sizeOf(SectorLog storage _self) public view returns (uint256 _size) {
      return (_self.nb);
      }
    }