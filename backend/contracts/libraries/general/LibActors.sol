// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

//import "../AppStorage.sol";
import "./LibTexts.sol";
import "./LibOwners.sol";


/* Librairy LibActors - Version Remix Compiler 0.8.18 OK : 27/05/2023 Edition 1.0.0
 * @title Roles library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente la structure de données et les fonctions
        associées pour traiter les données d'identité des objets dans la ruche
 */

uint8 constant ROLE_NULL = 0;
uint8 constant ROLE_FORAGER = 1;
uint8 constant ROLE_ALCHEMIST = 2;
uint8 constant ROLE_APIARIST = 4;

/* Structure StatusLog de base pour la plupart des objects / token
 * regroupe les informations communes d'identification des objects
 */

struct actorObj {
  uint256 stamp;
  string tag;
  uint8 value;
  }

struct ActorLog {
  uint256 nb;
  mapping(uint256 => actorObj) roles;  
  }


library LibActors {

    event roleChange(uint8 _new, string _tag, uint256 _stamp);

    function beacon_LibActors() public pure returns (string memory) { return "LibActors::1.0.0"; }


    function change(ActorLog storage _self, uint8 _role, string memory _tag) public {
      _self.roles[++_self.nb].value = _role;
      _self.roles[_self.nb].tag = _tag;
      _self.roles[_self.nb].stamp = block.timestamp;
      emit roleChange(_role, _tag, _self.roles[_self.nb].stamp);
      }

    function add(ActorLog storage _self, uint8 _role, string memory _tag) public {
      uint8 roles = _self.roles[_self.nb].value;
      _self.roles[++_self.nb].value = _role | roles;
      _self.roles[_self.nb].tag = _tag;
      _self.roles[_self.nb].stamp = block.timestamp;
      emit roleChange(_role, _tag, _self.roles[_self.nb].stamp);
      }

    function remove(ActorLog storage _self, uint8 _role, string memory _tag) public {
      uint8 roles = _self.roles[_self.nb].value;
      _self.roles[++_self.nb].value = ~_role & roles;
      _self.roles[_self.nb].tag = _tag;
      _self.roles[_self.nb].stamp = block.timestamp;
      emit roleChange(_role, _tag, _self.roles[_self.nb].stamp);
      }

    function current(ActorLog storage _self) public view returns (uint8 _role, uint256 _stamp, string memory _tag) {
      return (_self.roles[_self.nb].value, _self.roles[_self.nb].stamp, _self.roles[_self.nb].tag);
      }

    function previous(ActorLog storage _self, uint _rank) public view returns (uint8 _role, uint256 _stamp, string memory _tag) {
      return (_self.roles[_rank].value, _self.roles[_rank].stamp, _self.roles[_rank].tag);
      }

    function sizeOf(ActorLog storage _self) public view returns (uint256 _size) {
      return (_self.nb);
      }
    }