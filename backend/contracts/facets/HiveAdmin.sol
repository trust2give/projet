// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

/* Contrat HiveAdmin - Version Remix Compiler 0.8.18 OK : 27/05/2023 Edition 1.0
 * @title HIveAdmin Contract for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Ce contrat implémente les fonction Admin de création d'unités et de users 
 *      à partir d'une entités préalablement créée par l'owner de la ruche.
 */

import "./HiveBase.sol";
import "../libraries/AppStorage.sol";
import "../libraries/general/LibBaseCard.sol";
import "../libraries/company/LibEntities.sol";
import "../libraries/company/LibUnits.sol";
import "../libraries/user/LibUsers.sol";
import "../libraries/general/LibEnums.sol";

/* Contrat HiveRights
 *=============================================================================================
 * Ce smart Contract permet de gérer les acteurs (entités, unités et users) au sein de la Ruche
 * 
 * 
 *=============================================================================================*/

contract HiveAdmin is HiveBase {

  using LibEntities for AccountEntity;
  using LibBaseCard for BaseCard;
  using LibUnits for AccountUnit;
  using LibUsers for UserIdentity;

  event unitSuccess(bytes32 _id);
  event userSuccess(address _id);
  event unitStatusChanged(bytes32 _id, Status _new);
  event userStatusChanged(address _id, Status _new);

  /* Constructor 
   */ 
  constructor()  {}
  //
  // Function addUnit
  /*========================================================================================
   * Création d'une nouvelle unité pour une entité _parent donnée
   * Une unité est un périmètre pour lequel un Bilan Carbone est réalisé
   * Les données passées en entrée sont les informations minimales nécessaires pour créer l'unité
   * Le type de l'unité est imposé par le type par défaut indiqué dans l'entité parente
   * Les autres données sont initialisées ensuite.
   *    _parent (bytes32) : identifiant de l'entité parent de l'unité à créer
   *    _author (address) : @ETH de l'utilisateur à l'origine de la création de l'unité
   *    _siren / _siret[] (string) : identifiants uniques de l'unité à construire, selon le format national en vigueur
   *    _name (string) : nom de l'unité
   *    _country (uint8) : code indiquant la nationalité de l'unité. 
   *                       Si 0 alors le code de l'entité parente est pris en compte par défaut
   *    _sector (BusSector) : valeur indiquant le secteur d'activité de l'unité
   *========================================================================================*/
  //
  function addUnit( bytes32 _parent, string calldata _siren, string[] calldata _siret, string calldata _name,
                    uint8 _country, BusSector _sector  )
    external noReentrancy(msg.sender) isGranted( Profile.ADMIN) {
      s.unit[s.nbUnits+1].initUnit(_parent, _siren, _siret, _name, _country, _sector );
      }
  //
  // Function addUser
  /* =======================================================================================
   * Création d'un nouvel utilisateur membre d'une unité / entité déclarée
   * Un user est un compte @ETH qui va posséder un rôle dans le fonctionnement de la Ruche
   * Pour le compte de l'entité / unité dont elle dépend
   * Les données passées en entrée sont:
   *  _identity (UserIdentity) : struct contenant les valeurs pour la création du user.
   *========================================================================================*/
   //
  function addUser( bytes32 _parent, string calldata _last, string calldata _first, address _id, Profile _role )
    external noReentrancy(msg.sender) isGranted( Profile.ADMIN ) {
      s.user[s.nbUsers + 1].initUser(_parent, _last, _first, _id, _role);
      }
  //
  // Function find
  /*=========================================================================================
   * Permet de trouver une unit par ses SIREN/SIRET/nom, si elle est enregistrée
   * Permet de trouver un user par son adresse @ETH, si elle est enregistrée
   *=========================================================================================*/
  //
  function find( string calldata _siren, string[] calldata _siret, string calldata _name ) 
    external noReentrancy(msg.sender) isGranted( Profile.ADMIN )
    returns (bool _found, AccountUnit memory _unit) {
        bytes32 _accountId = (keccak256( abi.encodePacked( _siren, _siret[0], _name )));
        _found = LibUnits.isUnit(_accountId);
        if (_found) _unit = LibUnits.getUnit(_accountId);
       }

  function find( address _who ) 
    external noReentrancy(msg.sender) isGranted( Profile.ADMIN )
    returns (bool _found, UserIdentity memory _user) {
      _found = LibUsers.isUser(_who);
      if (_found) _user = LibUsers.getUser(_who);
      }

  /* Function setStatus
   * Fonction privée pour changer les statuts de toutes les users rattachés à une unité
   * En fonction du nouveau STATUS, parcours la liste des unités déclarées pour une entité donnée
   * et force le status en conséquence
   */
  function setStatus(bytes32 _parent, Status _new)
  private {
    LinkedListLib.LinkedList storage users = s.usersFromUnit[_parent];

    if (users.listExists()) {
      uint size = users.sizeOf();
      uint node = 0; // racine de la liste

      for (uint i = 0; i < size; i++) {
        (bool result, uint next) = users.getAdjacent( node, true);
        if (result) {
          if (_new == Status.ACTIVE) s.user[next].activate();          
          if (_new == Status.FROZEN) s.user[next].freeze();          
          if (_new == Status.CLOSED) s.user[next].close();          
          node = next;
          }
        }
      }
    }

  //
  // Functions activate, freeze, close (Unit, User)
  /*=========================================================================================
   * Permet de changer le statut d'une entité à ACTIVE
   * La fonction force le changement d'état de toutes les unités et users associés à l'état ACTIVE
   *=========================================================================================*/
  /*=========================================================================================
   * Permet de changer le statut d'une entité à FROZEN
   * La fonction force le changement d'état de toutes les unités et users associés à l'état FROZEN
   *=========================================================================================*/
  /*=========================================================================================
   * Permet de changer le statut d'une entité à CLOSED
   * La fonction force le changement d'état de toutes les unités et users associés à l'état CLOSE
   *=========================================================================================*/
  
  function activateUnit( bytes32 _unit) external noReentrancy(msg.sender) isGranted( Profile.ADMIN ) { 
    AccountUnit storage unit = s.unit[s.unitIndex[_unit]];
    if (unit.activate()) {
      setStatus(unit.id.id, Status.ACTIVE);
      emit unitStatusChanged( unit.id.id, Status.ACTIVE);
      }
    }

  function activateUser( address _user) external noReentrancy(msg.sender) isGranted( Profile.ADMIN ) { 
    UserIdentity storage user = s.user[s.userIndex[_user]];
    if (user.activate()) emit userStatusChanged( user.id, Status.ACTIVE);
    }

  function freezeUnit( bytes32 _unit) external noReentrancy(msg.sender) isGranted( Profile.ADMIN ) { 
    AccountUnit storage unit = s.unit[s.unitIndex[_unit]];
    if (unit.freeze()) {
      setStatus(unit.id.id, Status.FROZEN);
      emit unitStatusChanged( unit.id.id, Status.FROZEN);
      }
    }

  function freezeUser( address _user) external noReentrancy(msg.sender) isGranted( Profile.ADMIN ) { 
    UserIdentity storage user = s.user[s.userIndex[_user]];
    if (user.freeze()) emit userStatusChanged( user.id, Status.FROZEN);
    }

  function closeUnit( bytes32 _unit) external noReentrancy(msg.sender) isGranted( Profile.ADMIN ) { 
    AccountUnit storage unit = s.unit[s.unitIndex[_unit]];
    if (unit.close()) {
      setStatus(unit.id.id, Status.CLOSED);
      emit unitStatusChanged( unit.id.id, Status.CLOSED);
      }
    }

  function closeUser( address _user) external noReentrancy(msg.sender) isGranted( Profile.ADMIN ) { 
    UserIdentity storage user = s.user[s.userIndex[_user]];
    if (user.close()) emit userStatusChanged( user.id, Status.CLOSED);
    }

  //
  //
  function unitDescription( bytes32 _unit, string memory _description ) 
    external noReentrancy(msg.sender) isGranted( Profile.ADMIN ) {
    s.unit[s.unitIndex[_unit]].id.setDescription(_description);
    }
  function unitLogo( bytes32 _unit, string calldata _logo ) 
    external noReentrancy(msg.sender) isGranted( Profile.ADMIN ) {
    s.unit[s.unitIndex[_unit]].id.setLogo(_logo);
    }
  }
