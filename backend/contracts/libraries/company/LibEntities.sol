// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

/* Librairy LibEntities - Version Remix Compiler 0.8.18 OK : 27/05/2023 Edition 1.0
 * @title Entities library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente l'objet AccountEntity et ses fonctions associées
 */

import "../general/LibObjCard.sol";
import "../general/LibIdentifier.sol";
import "../general/LibEntity.sol";
import "../general/LibStatus.sol";
import "../general/LibErrors.sol";
import "../utils/LinkedListLib.sol";
import "../utils/StringUtilsLib.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// Librairie implémentant un journal de traçabilité des enregistrements

/* Type AccountEntity
 * Structure de base définissant une entité organisationnelle
 */ 
struct AccountEntity {
  /* Carte d'identité du AccountEntity
   * Identifiant unique hash calculé lors de l'initalisation d'un AccountEntity
   * L'identifiant @ID calculé est basé sur le nom, de la nature et du pays de l'entité créée
   * IL ne peut y avoir deux entités ayant le même truple (nom, nature, country)
   */
  ObjCard  card;
  IdLog id;
  EntityLog profile;
  StatusLog status; // Lifecycle status of the entity inside La Ruche
  uint8 country;
  }

struct EntityStorage {
  uint256 nbEntities; // Registre des entités inscrites dans la Ruche, accesible par leur Id@Bytes32
  mapping(uint256 => AccountEntity) entity;
  mapping(bytes32 => uint256) entityIndex;
  }

/* librairie LibRights
 *=============================================================================================
 * 
 *=============================================================================================*/

library LibEntities {
  using LibObjCard for ObjCard;
  using LibIdentifier for IdLog;
  using LibEntity for EntityLog;
  using LibStatus for StatusLog;
  using LibErrors for *;
  using LinkedListLib for LinkedListLib.LinkedList;
  using StringUtilsLib for *;
  using LibStatus for StatusLog;
  //using LibUnits for AccountUnit;

  event entityModified(bytes32 _id);

  // 1.0.1 : creation finction isEditable
  function beacon_LibEntities() public pure returns (string memory) { return "LibEntities::1.0.1"; }

  function isDraft(EntityStorage storage _self, bytes32 _id) external view returns (EntityStorage storage) {
    LibErrors.registered( ((_self.nbEntities > 0) && (_self.entityIndex[_id.notNull( "EntityId" )] > 0)), "Entity");
    (Status current, , ) = _self.entity[_self.entityIndex[_id]].status.current();
    if (current != Status.DRAFT) revert("Entity not draft status");
    return _self;
    }

  function isEditable(EntityStorage storage _self, bytes32 _id) external view returns (EntityStorage storage) {
    LibErrors.registered( ((_self.nbEntities > 0) && (_self.entityIndex[_id.notNull( "EntityId" )] > 0)), "Entity");
    (Status current, , ) = _self.entity[_self.entityIndex[_id]].status.current();
    if (current == Status.FROZEN || current == Status.CLOSED) revert("Entity not editable");
    return _self;
    }


  /// @dev check if a specific entity is registered or not
  /// @param _self stored EntityStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @return _entity - the pointer to the entity object, ptherwise revert error event
  function isEntity(EntityStorage storage _self, bytes32 _id) public view returns (AccountEntity storage _entity) {
    LibErrors.registered( ((_self.nbEntities > 0) && (_self.entityIndex[_id.notNull( "EntityId" )] > 0)), "Entity");
    _entity = _self.entity[_self.entityIndex[_id]];
    }

  /// @dev check if a specific entity is registered or not
  /// @param _self stored EntityStorage structure that contains user objects
  /// @param _name name of the entity to get @ID
  /// @return _entity - the @ID to the entity object, ptherwise revert error event
  function isEntity(EntityStorage storage _self, string memory _name) public view returns (bytes32 _entity) {
    LibErrors.registered( (_self.nbEntities > 0), "Entity");
    _entity = keccak256( abi.encodePacked( string.concat( "Root", _name ), Identity.ENTITY ));
    if (_self.entityIndex[_entity] == 0) revert( string.concat(_name, "::Entity Unknown" ) );
    }

  /// @dev check if a specific entity is registered or not
  /// @param _self stored EntityStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @return bool true is @ID is valid
  function isValid(EntityStorage storage _self, bytes32 _id) public view returns (bool) {
    return LibErrors.registered( ((_self.nbEntities > 0) && (_self.entityIndex[_id.notNull( "EntityId" )] > 0)), "Entity");
    }

  /// @dev return the total number of registered entities
  /// @param _self stored EntityStorage structure that contains user objects
  /// @return utin256 - the total number of registered entities, regardless their status
  function counts(EntityStorage storage _self) public view returns (uint256) { return (_self.nbEntities); }

  function uintToString(uint v) internal pure returns (string memory str) {
    uint maxlength = 100;
    bytes memory reversed = new bytes(maxlength);
    uint i = 0;
    while (v != 0) {
      v = v / 10;
      reversed[i++] = bytes1(48 + uint8(v % 10));
      }
    bytes memory s = new bytes(i);
    for (uint j = 0; j < i; j++) { s[j] = reversed[i - 1 - j]; }
    str = string(s);
    }

  /// @dev Create & initialize a new entity with preliminary data. Inital Tag is "Root"
  /// @param _self stored EntityStorage structure that contains user & parents
  /// @param _name name of the entity
  /// @return _id for the given entity
  function initEntity(EntityStorage storage _self, string calldata _name)
    public returns (bytes32 _id) {
      _name.notNull( "initEntity::Name");

      AccountEntity storage entity = _self.entity[++_self.nbEntities];
      _id = entity.id.create( Identity.ENTITY, string.concat( "Root", _name));
      _self.entityIndex[_id] = _self.nbEntities;

      entity.card.create( _name, bytes32(0) );
      entity.status.change( Status.DRAFT, "Root" );  
      }
  
  /// @dev Complete set up of a new entity with preliminary data. Inital Tag is "Root". To be call after InitUnit()
  /// @param _self stored EntityStorage structure that contains user & parents
  /// @param _id Bytes32 identifier of the parent entity to relate to
  /// @param _country belonging country of the new entity
  /// @param _nature nature of entity (see LibEntity for details)
  /// @param _type type of entity (see LibEntity for details)
  function setUpEntity(EntityStorage storage _self, bytes32 _id, uint8 _country, EntityType _nature, UnitType _type)
    public {
      //_country.notNone( "setUpEntity::Country");
      //uint8(_nature).notNone( "setUpEntity::Sector");
      //uint8(_type).notNone( "setUpEntity::Sector");

      AccountEntity storage entity = isEntity(_self, _id);
      entity.profile.change( _nature, _type, "Root" );
      entity.country = _country;

      emit entityModified(_id);
      }

  /// @dev Set specfic description to a entity which is not CLOSED
  /// @param _self stored EntityStorage structure that contains entity objects
  /// @param _id bytes32 of the entity to get identity features
  /// @param _detail description to set for the entity
  /// @param _tag Label to mark flag/identify the change
  function changeDescription(EntityStorage storage _self, bytes32 _id, string memory _detail, string memory _tag) public {
    _tag.notNull( "Tag");
    AccountEntity storage entity = isEntity( _self, _id);
    (Status current, , ) = entity.status.current();
    if (current != Status.CLOSED) {
      if (!_detail.toSlice().empty()) entity.card.Description( _detail, _tag );
      emit entityModified(_id);
      }
    }

  /// @dev Set specfic logo path to a entity which is not CLOSED
  /// @param _self stored EntityStorage structure that contains entity objects
  /// @param _id bytes32 of the entity to get identity features
  /// @param _path for the logo to set for the entity
  /// @param _tag Label to mark flag/identify the change
  function changeLogo(EntityStorage storage _self, bytes32 _id, string memory _path, string memory _tag) public {
    _tag.notNull( "Tag");
    AccountEntity storage entity = isEntity( _self, _id);
    (Status current, , ) = entity.status.current();
    if (current != Status.CLOSED) {
      if (!_path.toSlice().empty()) entity.card.Logo( _path, _tag );
      emit entityModified(_id);
      }
    }

  /// @dev returns the details related to the entity
  /// @param _self stored EntityStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @return _name for the given entity
  /// @return _detail for the given entity
  /// @return _status for the given entity
  /// @return _logo for the given entity
  function getEntity(EntityStorage storage _self, bytes32 _id) 
    public view 
    returns (string memory _name, string memory _detail, Status _status, string memory _logo) {
    AccountEntity storage entity = isEntity( _self, _id);
    (_name, _detail, _logo, , ) = entity.card.current();
    (_status,  ,  ) = entity.status.current();
    }

  /// @dev returns the details related to the type of entity
  /// @param _self stored EntityStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @return _country for the given entity
  /// @return _nature for the given entity
  /// @return _type for the given entity
  function getType(EntityStorage storage _self, bytes32 _id) 
    public view 
    returns (uint8 _country, EntityType _nature, UnitType _type) {
    AccountEntity storage entity = isEntity( _self, _id);
    _country = entity.country;
    (_nature, _type, , ) = entity.profile.current();
    }

  /// @dev activate a specific registered entity with already DRAFT or FROZEN status
  /// @param _self stored EntityStorage structure that contains user object
  /// @param _id bytes32 of the entity to activate
  function activate( EntityStorage storage _self, bytes32 _id, string calldata _tag) public {
    AccountEntity storage entity = isEntity( _self, _id);
    (Status current, , ) = entity.status.current();
    if (current != Status.FROZEN && current != Status.DRAFT) revert("Wrong Status");
    entity.status.change(Status.ACTIVE, _tag);
    }

  /// @dev freeze a specific registered entity with already DRAFT or ACTIVE status
  /// @param _self stored EntityStorage structure that contains user object
  /// @param _id bytes32 of the entity to freeze
  function freeze( EntityStorage storage _self, bytes32 _id, string calldata _tag) public {
    AccountEntity storage entity = isEntity( _self, _id);
    (Status current, , ) = entity.status.current();
    if (current != Status.ACTIVE && current != Status.DRAFT) revert("Wrong Status");
    entity.status.change(Status.FROZEN, _tag);
    }

  /// @dev close a specific registered entity with already DRAFT, FROZEN or ACTIVE status
  /// @param _self stored EntityStorage structure that contains user object
  /// @param _id bytes32 of the entity to close
  function close( EntityStorage storage _self, bytes32 _id, string calldata _tag) public {
    AccountEntity storage entity = isEntity( _self, _id);
    (Status current, , ) = entity.status.current();
    if (current == Status.CLOSED) revert("Wrong Status");
    entity.status.change(Status.CLOSED, _tag);
    }
}