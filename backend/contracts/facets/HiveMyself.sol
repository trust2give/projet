// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

/* Contrat HiveMyself - Version Remix Compiler 0.8.18 OK : 27/05/2023 Edition 1.0
 * @title HiveMyself Contract for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Ce contrat implémente les fonction de compte de user 
 */


import "./HiveBase.sol";
import "../libraries/AppStorage.sol";
//import "../libraries/company/LibEntities.sol";
//import "../libraries/company/LibUnits.sol";
import "../libraries/user/LibUsers.sol";
import "../libraries/general/LibEnums.sol";

/* Contrat HiveMyself
 *=============================================================================================
 * Ce smart Contract permet au user connecté l'accès à ses propres informations 
 * (entités, unités et users) au sein de la Ruche
 * 
 * 
 *=============================================================================================*/
 
contract HiveMyself is HiveBase {

  //using LibEntities for AccountEntity;
  //using LibUnits for AccountUnit;
  using LibUsers for UserIdentity;
  using LibUsers for address;

  /* Constructor 
   */ 
  constructor()  {
    }
  //
  // Function findUnitsFromUser
  /*========================================================================================
   * Permet d'obtenir les informations des unités liées à un utilisateur @ETH spécifiques
   *========================================================================================*/
  //

  function findUnitsFromUser( address _user ) external noReentrancy(msg.sender) 
    returns (bool _found, bytes32[] memory _units) {
      _found = _user.isUser();
      if (_found) _units = _user.getUser().parent;
      }
  // Functions my (Entity, Unit, User) & AmIRegistered
  /*=========================================================================================
   * Permet d'obtenir ses informations personnelles enregistrées
   * Permet d'obtenir les informations de son entité juridique (Entité & Unité de rattachement)
   * Permet de vérifier si un compte utilisateur @ETH est enregistré ou pas
   *=========================================================================================*/
  //
  function myIdentity() external noReentrancy(msg.sender) 
    returns (UserIdentity memory) { return (msg.sender).getUser(); }

  function myCompany() external noReentrancy(msg.sender) 
    returns (bool _found, bytes32[] memory _units) { return this.findUnitsFromUser(msg.sender); }

  function amIRegistered() external noReentrancy(msg.sender) returns (bool) { return (msg.sender).isUser(); }

  }
