// SPDX-License-Identifier: UNLICENCED

/* Librairy LibStatus - Version Remix Compiler 0.8.18 : 02/08/2023 Edition 1.0
 * @title Status library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente des fonctions de gestion d'un statut d'objet
 */

pragma solidity ^0.8.11;

/* Type ObjectStatus 
 * Utilisé pour les objets de types Entité, Units, Users
 */

enum Status {
  INIT,       // Etat transitoire par défault à la création d'un objet
  DRAFT,      // Etat d'un objet enregistré mais pas encore actif
  ACTIVE,     // Etat d'un objet actif et prêt à être utilisé
  FROZEN,     // Etat d'un objet temporairement suspendu
  CLOSED      // Etat d'un objet fermé
  }

/* Type PollenStatus 
 * Utilisé pour les token POLLEN
 */
enum PollenStatus {
  INIT,         // Etat transitoire par défault à la création d'un POLLEN
  DRAFT,        // Etat d'un POLLEN enregistré mais pas encore certifié
  CERTIFIED,    // Etat d'un POLLEN certifié et prêt à être utilisé pour un NEKTAR
  BOUND,        // Etat d'un POLLEN lié à un NEKTAR,
  EATEN,        // Etat d'un POLLEN consommé au travers d'un NEKTAR
  CANCELED      // Etat d'un POLLEN annulé
}

/* Type NektarStatus 
 * Utilisé pour les token NEKTAR
 */
enum NektarStatus {
  INIT,         // Etat transitoire par défault à la création d'un NEKTAR
  DRAFT,        // Etat d'un NEKTAR enregistré mais pas encore certifié
  CERTIFIED,    // Etat d'un NEKTAR certifié et prêt à être utilisé pour un HONEY
  EATEN,        // Etat d'un NEKTAR consommé au travers d'un HONEY
  CANCELED      // Etat d'un NEKTAR annulé
}

/* Type NektarStatus 
 * Utilisé pour les token NEKTAR
 */
enum CellStatus {
  INIT,         // Etat transitoire par défault à la création d'un NEKTAR
  DRAFT,        // Etat d'un NEKTAR enregistré mais pas encore certifié
  CERTIFIED,    // Etat d'un NEKTAR certifié et prêt à être utilisé pour un HONEY
  EATEN,        // Etat d'un NEKTAR consommé au travers d'un HONEY
  CANCELED      // Etat d'un NEKTAR annulé
}

struct stateObj {
  uint256 stamp;
  string tag;
  Status value;
  PollenStatus pollen;
  NektarStatus nektar;
  CellStatus cell;
  }

struct StatusLog {
  uint256 nb;
  mapping(uint256 => stateObj) state;  
  }

/* Données de comptes */

library LibStatus {

    event statusChange(uint8 _new, string _tag, uint256 _stamp);

    function beacon_LibStatus() public pure returns (string memory) { return "LibStatus::1.0.0"; }

    function change(StatusLog storage _self, Status _state, string memory _tag) public {
      _self.state[++_self.nb].value = _state;
      _self.state[_self.nb].tag = _tag;
      _self.state[_self.nb].stamp = block.timestamp;
      emit statusChange(uint8(_state), _tag, _self.state[_self.nb].stamp);
      }

    function changePollen(StatusLog storage _self, PollenStatus _state, string memory _tag) public {
      _self.state[++_self.nb].pollen = _state;
      _self.state[_self.nb].tag = _tag;
      _self.state[_self.nb].stamp = block.timestamp;
      emit statusChange(uint8(_state), _tag, _self.state[_self.nb].stamp);
      }

    function changeNektar(StatusLog storage _self, NektarStatus _state, string memory _tag) public {
      _self.state[++_self.nb].nektar = _state;
      _self.state[_self.nb].tag = _tag;
      _self.state[_self.nb].stamp = block.timestamp;
      emit statusChange(uint8(_state), _tag, _self.state[_self.nb].stamp);
      }

    function changeCell(StatusLog storage _self, CellStatus _state, string memory _tag) public {
      _self.state[++_self.nb].cell = _state;
      _self.state[_self.nb].tag = _tag;
      _self.state[_self.nb].stamp = block.timestamp;
      emit statusChange(uint8(_state), _tag, _self.state[_self.nb].stamp);
      }

    function current(StatusLog storage _self) public view returns (Status _state, uint256 _stamp, string memory _tag) {
      return (_self.state[_self.nb].value, _self.state[_self.nb].stamp, _self.state[_self.nb].tag);
      }

    function currentPollen(StatusLog storage _self) public view returns (PollenStatus _state, uint256 _stamp, string memory _tag) {
      return (_self.state[_self.nb].pollen, _self.state[_self.nb].stamp, _self.state[_self.nb].tag);
      }

    function currentNektar(StatusLog storage _self) public view returns (NektarStatus _state, uint256 _stamp, string memory _tag) {
      return (_self.state[_self.nb].nektar, _self.state[_self.nb].stamp, _self.state[_self.nb].tag);
      }

    function currentCell(StatusLog storage _self) public view returns (CellStatus _state, uint256 _stamp, string memory _tag) {
      return (_self.state[_self.nb].cell, _self.state[_self.nb].stamp, _self.state[_self.nb].tag);
      }

    function previous(StatusLog storage _self, uint _rank) public view returns (Status _state, uint256 _stamp, string memory _tag) {
      return (_self.state[_rank].value, _self.state[_rank].stamp, _self.state[_rank].tag);
      }

    function previousPollen(StatusLog storage _self, uint _rank) public view returns (PollenStatus _state, uint256 _stamp, string memory _tag) {
      return (_self.state[_rank].pollen, _self.state[_rank].stamp, _self.state[_rank].tag);
      }

    function previousNektar(StatusLog storage _self, uint _rank) public view returns (NektarStatus _state, uint256 _stamp, string memory _tag) {
      return (_self.state[_rank].nektar, _self.state[_rank].stamp, _self.state[_rank].tag);
      }

    function sizeOf(StatusLog storage _self) public view returns (uint256 _size) {
      return (_self.nb);
      }

    }