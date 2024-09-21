// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

/* Contrat HiveManager - Version Remix Compiler 0.8.18 OK : 27/05/2023 Edition 1.0
 * @title HiveManager Contract for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Ce contrat implémente les fonction Manager de création d'entités et d'unités et de users 
 */

import "./HiveBase.sol";
import "../libraries/AppStorage.sol";
import "../libraries/general/LibBaseCard.sol";
import "../libraries/company/LibEntities.sol";
import "../libraries/company/LibUnits.sol";
import "../libraries/user/LibUsers.sol";
import "../libraries/general/LibEnums.sol";
import "../libraries/utils/LinkedListLib.sol";

/* Contrat HiveManager
 *=============================================================================================
 * Ce smart Contract est réservé aux administrateurs de la Ruche pour la création des comptes
 * 
 * 
 *=============================================================================================*/

contract HiveManager is HiveBase {

  using LibEntities for AccountEntity;
  using LibBaseCard for BaseCard;
  using LibUnits for AccountUnit;
  using LibUsers for UserIdentity;
  using LinkedListLib for LinkedListLib.LinkedList;

  event entitySuccess(bytes32 _id);
  event entityStatusChanged(bytes32 _id, Status _new);

  /* Constructor 
   * Créé au départ le compte Admin et met à jour les variables liées aux compte entreprises
   * _owner[] : liste des adresses @ETH (autres que msg.sender) qui vont avoir les droits admin
   */ 
  constructor( address[] memory _owners)  {
    s.owner = new address[](0);
    // On initialise à minima la liste des @ETH Admin avec celle qui construit le Smart Contract
    s.owner.push(msg.sender);
    for (uint8 i = 0; i < _owners.length; i++) {
      if (_owners[i] != msg.sender) s.owner.push(_owners[i]);
      }
    }
  //
  // Function newEntity
  /*========================================================================================
   * Création d'une nouvelle entité organisationnelle à la base d'unités et de comptes users
   * Fonction activable uniquement par un compte admin de la ruche
   * Une entité est la base d'une nouvelle organisation utilisatrice des services de la Ruche
   * Elle dépend de sa nature et doit réaliser un Bilan Carbone Global associé à une trajectoire de réduction de GES
   *    _author (address) : @ETH de l'utilisateur à l'origine de la création de l'entité
   *    _name (string) : nom de l'entité
   *    _country (uint8) : code indiquant la nationalité de l'entité. 
   *    _nature (EntityType) : valeur indiquant la nature de l'entité
   *    _type (UnitType) : valeur indiquant le type d'unités rattachées par défaut.
   *========================================================================================*/
   //
  function newEntity( string memory _name, uint8 _country, EntityType _nature, UnitType _type  )
    external noReentrancy(msg.sender) onlyOwner {
      s.entity[s.nbEntities + 1].initEntity( _name, _country, _nature, _type );
      }
  //
  // Function newUnit
  /*========================================================================================
   * Création d'une nouvelle unité pour une entité _parent donnée
   * Une unité est un périmètre pour lequel un Bilan Carbone est réalisé
   * Les données passées en entrée sont les informations minimales nécessaires pour créer l'unité
   * Le type de l'unité est imposé par le type par défaut indiqué dans l'entité parente
   * Les autres données sont initialisées ensuite.
   *    _parent (bytes32) : identifiant de l'entité parent de l'unité à créer
   *    _siren / _siret[] (string) : identifiants uniques de l'unité à construire, selon le format national en vigueur
   *    _name (string) : nom de l'unité
   *    _country (uint8) : code indiquant la nationalité de l'unité. 
   *                       Si 0 alors le code de l'entité parente est pris en compte par défaut
   *    _sector (BusSector) : valeur indiquant le secteur d'activité de l'unité
   *========================================================================================*/
  //
  function newUnit( bytes32 _parent, string calldata _siren, string[] calldata _siret, string calldata _name,
                    uint8 _country, BusSector _sector  )
    external noReentrancy(msg.sender) onlyOwner {
      s.unit[s.nbUnits+1].initUnit(_parent, _siren, _siret, _name, _country, _sector );
      }
  //
  // Function newUser
  /* =======================================================================================
   * Création d'un nouvel utilisateur membre d'une unité / entité déclarée
   * Un user est un compte @ETH qui va posséder un rôle dans le fonctionnement de la Ruche
   * Pour le compte de l'entité / unité dont elle dépend
   * Les données passées en entrée sont:
   *  _identity (UserIdentity) : struct contenant les valeurs pour la création du user.
   *========================================================================================*/
   //
  function newUser( bytes32 _parent, string calldata _last, string calldata _first, address _id, Profile _role )
    external noReentrancy(msg.sender) onlyOwner {
      s.user[s.nbUsers + 1].initUser(_parent, _last, _first, _id, _role);
      }
  //
  // Function findUnitsFromUser
  /*========================================================================================
   * Permet d'obtenir les informations des unités liées à un utilisateur @ETH spécifiques
   *========================================================================================*/
  //

  function findUnitsFromUser( address _user ) 
    external noReentrancy(msg.sender) onlyOwner
    returns (bool _found, bytes32[] memory _units) {
      _found = LibUsers.isUser(_user);
      if (_found) {
        _units = LibUsers.getUser(_user).parent;
        }
      }
  //
  // Function find (Entité)
  /*=========================================================================================
   * Permet de trouver une entité par son nom et sa nature, si elle est enregistrée
   *=========================================================================================*/
  //
  function find( string memory _name, EntityType _nature ) 
    external noReentrancy(msg.sender) onlyOwner
    returns (bool _found, AccountEntity memory _entity) {
        bytes32 _accountId = (keccak256( abi.encodePacked( _name, _nature )));
        _found = LibEntities.isEntity(_accountId);
        if (_found) _entity = LibEntities.getEntity(_accountId);
       }

  /* Function setStatus
   * Fonction privée pour changer les statuts de toutes les unités rattachés à une entité
   * En fonction du nouveau STATUS, parcours la liste des unités déclarées pour une entité donnée
   * et force le status en conséquence
   */
  function setStatus(bytes32 _parent, Status _new)
  private {
    LinkedListLib.LinkedList storage units = s.unitsFromEntity[_parent];

    if (units.listExists()) {
      uint size = units.sizeOf();
      uint node = 0; // racine de la liste

      for (uint i = 0; i < size; i++) {
        (bool result, uint next) = units.getAdjacent( node, true);
        if (result) {
          if (_new == Status.ACTIVE) s.unit[next].activate();          
          if (_new == Status.FROZEN) s.unit[next].freeze();          
          if (_new == Status.CLOSED) s.unit[next].close();          
          node = next;
          }
        }
      }
    }

  //
  // Functions activate, freeze & close (Entity)
  /*=========================================================================================
   * Permet de changer le statut d'une entité à ACTIVE, FROZEN ou CLOSE
   * La fonction force le changement d'état de toutes les unités et users associés à l'état
   *=========================================================================================*/

  function activateEntity( bytes32 _entity) external noReentrancy(msg.sender) onlyOwner { 
    AccountEntity storage entity = s.entity[s.entityIndex[_entity]];
    if (entity.activate()) {
      setStatus(entity.id.id, Status.ACTIVE);
      emit entityStatusChanged( entity.id.id, Status.ACTIVE);
      }
    }
  
  function freezeEntity( bytes32 _entity) external noReentrancy(msg.sender) onlyOwner { 
    AccountEntity storage entity = s.entity[s.entityIndex[_entity]];
    if (entity.freeze()) {
      setStatus(entity.id.id, Status.FROZEN);
      emit entityStatusChanged( entity.id.id, Status.FROZEN);
      }
    }

  function closeEntity( bytes32 _entity) external noReentrancy(msg.sender) onlyOwner { 
    AccountEntity storage entity = s.entity[s.entityIndex[_entity]];
    if (entity.close()) {
      setStatus(entity.id.id, Status.CLOSED);
      emit entityStatusChanged( entity.id.id, Status.CLOSED);
      }
    }

  //
  //
  function entityDescription( bytes32 _entity, string memory _description ) 
    external noReentrancy(msg.sender) onlyOwner {
      s.entity[s.entityIndex[_entity]].id.setDescription(_description);
      }

  function entityLogo( bytes32 _entity, string calldata _logo ) 
    external noReentrancy(msg.sender) onlyOwner {
      s.entity[s.entityIndex[_entity]].id.setLogo(_logo);
      }
  }
