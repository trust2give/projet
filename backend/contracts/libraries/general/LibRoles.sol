// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

//import "../AppStorage.sol";
import "./LibTexts.sol";
import "./LibOwners.sol";


/* Librairy LibUserCard - Version Remix Compiler 0.8.18 OK : 27/05/2023 Edition 1.0
 * @title Roles library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente la structure de données et les fonctions
        associées pour traiter les données d'identité des objets dans la ruche
 */

/* Type Profile pour les utilisateurs et leurs rôles et respondabilité au sein de la ruche
 * ADMIN: Administrateur des données de l’organisation dans la ruche
 * BUSINESS: Collecte et manage les Bilans Carbones / POLLEN
 * CERTIFICATEUR: Certificateur des Bilan Carbone
 * FINANCIER: Autorité Comptable et Financière de l’organisation
 * FINANCEUR: Influenceur / Entité qui finance les gains
 * MANDATAIRE: Intermédiaire / Apporteur de financeurs / business
 * PROMOTEUR: Utilisateur des Rewards / résultats liés aux activités de la ruche
 * DECIDEUR: Validateur / décisionnaire sur les Quotas
 * READER: Lecteur des données issues de l’activité de la ruche
 * REPORT: Responsable des résultats de gains / financiers / reporting legal
 */ 

uint16 constant ROLE_NONE = 0;
uint16 constant ROLE_ADMIN = 1;
uint16 constant ROLE_BUSINESS = 2;
uint16 constant ROLE_CERTIFIER = 4;
uint16 constant ROLE_FINANCE = 8;
uint16 constant ROLE_FUNDER = 16;
uint16 constant ROLE_DELEGATE = 32;
uint16 constant ROLE_PROMOTE = 64;
uint16 constant ROLE_DECISION = 128;
uint16 constant ROLE_READER = 256;
uint16 constant ROLE_REPORT = 512;

/* Structure StatusLog de base pour la plupart des objects / token
 * regroupe les informations communes d'identification des objects
 */

struct roleObj {
  uint256 stamp;
  string tag;
  uint16 value;
  }

struct RolesLog {
  uint256 nb;
  mapping(uint256 => roleObj) roles;  
  }


library LibRoles {

    event roleChange(uint16 _new, string _tag, uint256 _stamp);

    function beacon_LibRoles() public pure returns (string memory) { return "LibRoles::1.0.0"; }

    function change(RolesLog storage _self, uint16 _role, string memory _tag) public {
      _self.roles[++_self.nb].value = _role;
      _self.roles[_self.nb].tag = _tag;
      _self.roles[_self.nb].stamp = block.timestamp;
      emit roleChange(_role, _tag, _self.roles[_self.nb].stamp);
      }

    function add(RolesLog storage _self, uint16 _role, string memory _tag) public {
      uint16 roles = _self.roles[_self.nb].value;
      _self.roles[++_self.nb].value = _role | roles;
      _self.roles[_self.nb].tag = _tag;
      _self.roles[_self.nb].stamp = block.timestamp;
      emit roleChange(_role, _tag, _self.roles[_self.nb].stamp);
      }

    function remove(RolesLog storage _self, uint16 _role, string memory _tag) public {
      uint16 roles = _self.roles[_self.nb].value;
      _self.roles[++_self.nb].value = ~_role & roles;
      _self.roles[_self.nb].tag = _tag;
      _self.roles[_self.nb].stamp = block.timestamp;
      emit roleChange(_role, _tag, _self.roles[_self.nb].stamp);
      }

    function current(RolesLog storage _self) public view returns (uint16 _role, uint256 _stamp, string memory _tag) {
      return (_self.roles[_self.nb].value, _self.roles[_self.nb].stamp, _self.roles[_self.nb].tag);
      }

    function previous(RolesLog storage _self, uint _rank) public view returns (uint16 _role, uint256 _stamp, string memory _tag) {
      return (_self.roles[_rank].value, _self.roles[_rank].stamp, _self.roles[_rank].tag);
      }

    function sizeOf(RolesLog storage _self) public view returns (uint256 _size) {
      return (_self.nb);
      }
    }