// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

/* Librairy LibUnits - Version Remix Compiler 0.8.18 OK : 27/05/2023 Edition 1.0
 * @title Units library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente l'objet AccountUnit et ses fonctions associées
 */

import "../general/LibIdentifier.sol";
import "../general/LibUnitCard.sol";
import "../general/LibActors.sol";
import "../general/LibSizes.sol";
import "../general/LibEntity.sol";
import "../general/LibSector.sol";
import "../general/LibErrors.sol";
import "../utils/LinkedListLib.sol";
import "../general/LibStatus.sol";
import "../utils/StringUtilsLib.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/* Données de comptes */

struct UnitStorage {
  uint256 nbUnits; // Registre des unités inscrites dans la Ruche, accesible par leur Id@Bytes32
  mapping(uint256 => AccountUnit) unit;
  mapping(bytes32 => uint256) unitIndex;
  mapping(bytes32 => LinkedListLib.LinkedList) unitsFromEntity;
  }

/* Type AccountUnit
 * Structure de base définissant une unité organisationnelle d'une entité AccountEntity
 */

struct AccountUnit {
  UnitCard  card;
  IdLog id;
  EntityLog profile;
  StatusLog status; // Lifecycle status of the unit inside La Ruche
  SizesLog size;    // Taille de l'unité modifiable dans le cour de la vie de la ruche
  SectorLog sector; // Secteur d'activité de l'unité initialisé à la création et non modifiable
  uint8 country;    // Nationalité de l'unité initialisé à la création et non modifiable
  ActorLog actor;   
  }

// Librairie LIbUnits
// Implémentante les fonctions permettant de gérer les unités organisationnelles dans la Ruche

library LibUnits {

  using LibUnitCard for UnitCard;
  using LibErrors for *;
  using LinkedListLib for LinkedListLib.LinkedList;
  using LibIdentifier for IdLog;
  using LibEntity for EntityLog;
  using LibSizes for SizesLog;
  using LibSector for SectorLog;
  using LibActors for ActorLog;
  using LibStatus for StatusLog;
  using StringUtilsLib for *;

  event unitModified(bytes32 _id);

  function beacon_LibUnits() public pure returns (string memory) { return "LibUnits::1.0.0"; }

  function isDraft(UnitStorage storage _self, bytes32 _id) external view returns (UnitStorage storage) {
  LibErrors.registered( ((_self.nbUnits > 0) && (_self.unitIndex[_id.notNull( "UnitId" )] > 0)), "Unit");
  (Status current, , ) = _self.unit[_self.unitIndex[_id]].status.current();
  if (current != Status.DRAFT) revert("Unit not editable");
  return _self;
  }


  /// @dev check if a specific unit is registered or not
  /// @param _self stored UnitStorage structure that contains unit objects
  /// @param _id @ETH address of the user to get identity features
  /// @return _unit - the pointer to the unit object, ptherwise revert error event
  function isUnit(UnitStorage storage _self, bytes32 _id) public view returns (AccountUnit storage _unit) {
    LibErrors.registered( ((_self.nbUnits > 0) && (_self.unitIndex[_id.notNull( "UnitId" )] > 0)), "Unit");
    _unit = _self.unit[_self.unitIndex[_id]];
    }
  
  /// @dev check if a specific unit is registered or not
  /// @param _self stored UnitStorage structure that contains unit objects
  /// @param _siren siren of the unit to get @ID
  /// @param _siret siret of the unit to get @ID
  /// @return _unit - the @ID to the entity object, ptherwise revert error event
  function isUnit(UnitStorage storage _self, string memory _siren, string memory _siret) public view returns (bytes32 _unit) {
    LibErrors.registered( (_self.nbUnits > 0), "Units");
    _unit = keccak256( abi.encodePacked( string.concat( "Root", _siren, _siret ), Identity.UNIT ));
    if (_self.unitIndex[_unit] == 0) revert( string.concat(_siren, ":", _siret, "::Unit Unknown" ) );
    }

  /// @dev check if a specific unit is registered or not
  /// @param _self stored UnitStorage structure that contains user objects
  /// @param _id @ETH address of the unit to get identity features
  /// @return bool true is @ID is valid
  function isValid(UnitStorage storage _self, bytes32 _id) public view returns (bool) {
    return LibErrors.registered( ((_self.nbUnits > 0) && (_self.unitIndex[_id.notNull( "UnitId" )] > 0)), "Unit");
    }

  /// @dev return the total number of registered units
  /// @param _self stored UnitStorage structure that contains user objects
  /// @return utin256 - the total number of registered units, regardless their status
  function counts(UnitStorage storage _self) public view returns (uint256) { return (_self.nbUnits); }

  /// @dev Create & initialize a new unit with preliminary data. Inital Tag is "Root"
  /// @param _self stored UnitStorage structure that contains user & parents
  /// @param _parent Bytes32 identifier of the parent entity to relate to
  /// @param _siren siren or similar of the unit
  /// @param _siret siret or similar of the unit
  /// @param _name name of the unit
  /// @return _id for the given entity
  function initUnit(UnitStorage storage _self, bytes32 _parent, string calldata _siren, string calldata _siret, string calldata _name)
    public returns (bytes32 _id) {
      //LibErrors.notRegistered( ((_self.nbUnits > 0) && (_self.unitIndex[_id.notNull( "UnitId" )] > 0)), "Unit");

      _name.notNull( "Name");
      _siren.notNull( "Siren");
      _siret.notNull( "Siret");
      _parent.notNull( "Unit");

      AccountUnit storage unit = _self.unit[++_self.nbUnits];
      _id = unit.id.create( Identity.UNIT, string.concat( "Root", _siren, _siret ));
      _self.unitIndex[_id] = _self.nbUnits;

      unit.card.create( _name, _siren, _siret );
      unit.status.change( Status.DRAFT, "Root" );  
      unit.card.Owner(OwnerType.ENTITY, _parent, "Root");

      _self.unitsFromEntity[_parent].push( _self.nbUnits, true);
      }

  /// @dev Complete set up of a new unit with preliminary data. Inital Tag is "Root". To be call after InitUnit()
  /// @param _self stored UnitStorage structure that contains user & parents
  /// @param _id Bytes32 identifier of the parent entity to relate to
  /// @param _country belonging country of the new unit
  /// @param _nature nature of unit (see LibEntity for details)
  /// @param _type type of unit (see LibEntity for details)
  /// @param _sector business sector of the new unit
  function setUpUnit(UnitStorage storage _self, bytes32 _id, uint8 _country, EntityType _nature, UnitType _type, BusSector _sector, UnitSize _size)
    public {
      //_country.notNone( "Country");
      //uint8(_nature).notNone( "Sector");
      //uint8(_type).notNone( "Sector");
      //uint8(_sector).notNone( "Sector");
      //uint8(_size).notNone( "Size");

      AccountUnit storage unit = isUnit( _self, _id);

      unit.sector.change( _sector, "Root" );
      unit.profile.change( _nature, _type, "Root" );
      unit.size.change( _size, "Root" );
      unit.country = _country;

      emit unitModified(_id);
      }

  /// @dev returns the details related to the unit
  /// @param _self stored UnitStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @return _name for the given unit
  /// @return _detail for the given unit
  /// @return _siren for the given unit
  /// @return _siret for the given unit
  /// @return _status for the given unit
  /// @return _logo for the given unit
  /// @return _contact for the given unit
  function getUnit(UnitStorage storage _self, bytes32 _id) 
    public view 
    returns (string memory _name, string memory _detail, string memory _siren, string memory _siret, Status _status, string memory _logo, string memory _contact) {
    AccountUnit storage unit = isUnit( _self, _id);
    (_name, _detail, _siren, _siret, _logo, , _contact, ) = unit.card.current();
    (_status,  ,  ) = unit.status.current();
    }

  /// @dev returns the details related to the type of unit
  /// @param _self stored UnitStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @return _country for the given unit
  /// @return _profile for the given unit
  /// @return _type for the given unit
  /// @return _size for the given unit
  /// @return _sector for the given unit
  function getType(UnitStorage storage _self, bytes32 _id) 
    public view 
    returns (uint8 _country, EntityType _profile, UnitType _type, UnitSize _size, BusSector _sector) {
    AccountUnit storage unit = isUnit( _self, _id);
    _country = unit.country;
    (_profile, _type, , ) = unit.profile.current();
    (_size, , ) = unit.size.current();
    (_sector, , ) = unit.sector.current();
    }

  /// @dev returns the parents related to the user
  /// @param _self stored UserStorage structure that contains user & parents list
  /// @param _id @ETH address of the user to get the parents from
  /// @return _parent Array of bytes32 (parent's id) for the given user
  function getParent(UnitStorage storage _self, bytes32 _id) public view returns (bytes32 _parent) {
    AccountUnit storage unit = isUnit( _self, _id);
    ( , , , , , _parent, , ) = unit.card.current();
    }

  /// @dev Set specfic actor role to a unit which is not CLOSED
  /// @param _self stored UnitStorage structure that contains unit objects
  /// @param _id bytes32 of the unit to get identity features
  /// @param _role to set for the unit (see LibActors for values)
  /// @param _tag Label to mark flag/identify the change
  function changeRole(UnitStorage storage _self, bytes32 _id, uint8 _role, string memory _tag) public {
    _tag.notNull( "Tag");
    AccountUnit storage unit = isUnit( _self, _id);
    (Status current, , ) = unit.status.current();
    if (current != Status.CLOSED) {
      unit.actor.change( _role, _tag );
      emit unitModified(_id);
      }
    }

  /// @dev change specfic owner to a unit which is not CLOSED
  /// @param _self stored UnitStorage structure that contains unit objects
  /// @param _id bytes32 of the unit to get identity features
  /// @param _parent bytes32 id to set for the unit
  /// @param _tag Label to mark flag/identify the change
  function changeOwner(UnitStorage storage _self, bytes32 _id, bytes32 _parent, string memory _tag) public {
    _tag.notNull( "Tag");
    AccountUnit storage unit = isUnit( _self, _id);
    (Status current, , ) = unit.status.current();
    if (current != Status.CLOSED) {
      unit.card.Owner(OwnerType.ENTITY, _parent, _tag);
      emit unitModified(_id);
      }
    }

  /// @dev Set specfic contact email to a unit which is not CLOSED
  /// @param _self stored UnitStorage structure that contains unit objects
  /// @param _id bytes32 of the unit to get identity features
  /// @param _email email address to set for the unit
  /// @param _tag Label to mark flag/identify the change
  function changeContact(UnitStorage storage _self, bytes32 _id, string memory _email, string memory _tag) public {
    _tag.notNull( "Tag");
    AccountUnit storage unit = isUnit( _self, _id);
    (Status current, , ) = unit.status.current();
    if (current != Status.CLOSED) {
      if (!_email.toSlice().empty()) unit.card.Contact( _email, _tag );
      emit unitModified(_id);
      }
    }

  /// @dev Set specfic description to a unit which is not CLOSED
  /// @param _self stored UnitStorage structure that contains unit objects
  /// @param _id bytes32 of the unit to get identity features
  /// @param _detail description to set for the unit
  /// @param _tag Label to mark flag/identify the change
  function changeDescription(UnitStorage storage _self, bytes32 _id, string memory _detail, string memory _tag) public {
    _tag.notNull( "Tag");
    AccountUnit storage unit = isUnit( _self, _id);
    (Status current, , ) = unit.status.current();
    if (current != Status.CLOSED) {
      if (!_detail.toSlice().empty()) unit.card.Description( _detail, _tag );
      emit unitModified(_id);
      }
    }

  /// @dev Set specfic logo path to a unit which is not CLOSED
  /// @param _self stored UnitStorage structure that contains unit objects
  /// @param _id bytes32 of the unit to get identity features
  /// @param _path for the logo to set for the unit
  /// @param _tag Label to mark flag/identify the change
  function changeLogo(UnitStorage storage _self, bytes32 _id, string memory _path, string memory _tag) public {
    _tag.notNull( "Tag");
    AccountUnit storage unit = isUnit( _self, _id);
    (Status current, , ) = unit.status.current();
    if (current != Status.CLOSED) {
      if (!_path.toSlice().empty()) unit.card.Logo( _path, _tag );
      emit unitModified(_id);
      }
    }

  /// @dev Set specfic size to a unit which is not CLOSED
  /// @param _self stored UnitStorage structure that contains unit objects
  /// @param _id bytes32 of the unit to get identity features
  /// @param _size size to set for the unit
  /// @param _tag Label to mark flag/identify the change
  function changeSize(UnitStorage storage _self, bytes32 _id, UnitSize _size, string memory _tag) public {
    _tag.notNull( "Tag");
    AccountUnit storage unit = isUnit( _self, _id);
    (Status current, , ) = unit.status.current();
    if (current != Status.CLOSED) {
      unit.size.change( _size, _tag );
      emit unitModified(_id);
      }
    }

  /// @dev activate a specific registered unit with already DRAFT or FROZEN status
  /// @param _self stored UserStorage structure that contains user object
  /// @param _id bytes32 of the unit to activate
  function activate( UnitStorage storage _self, bytes32 _id, string calldata _tag) public {
    AccountUnit storage unit = isUnit( _self, _id);
    (Status current, , ) = unit.status.current();
    if (current == Status.FROZEN || current == Status.DRAFT) {
      unit.status.change(Status.ACTIVE, _tag);
      emit unitModified(_id);
      }
    }

  /// @dev freeze a specific registered unit with already DRAFT or ACTIVE status
  /// @param _self stored UserStorage structure that contains user object
  /// @param _id bytes32 of the unit to freeze
  function freeze( UnitStorage storage _self, bytes32 _id, string calldata _tag) public {
    AccountUnit storage unit = isUnit( _self, _id);
    (Status current, , ) = unit.status.current();
    if (current == Status.ACTIVE || current == Status.DRAFT) {
      unit.status.change(Status.FROZEN, _tag);
      emit unitModified(_id);
      }
    }

  /// @dev close a specific registered unit with already DRAFT, FROZEN or ACTIVE status
  /// @param _self stored UserStorage structure that contains user object
  /// @param _id bytes32 of the unit to close
  function close( UnitStorage storage _self, bytes32 _id, string calldata _tag) public {
    AccountUnit storage unit = isUnit( _self, _id);
    (Status current, , ) = unit.status.current();
    if (current != Status.CLOSED) {
      unit.status.change(Status.CLOSED, _tag);
      emit unitModified(_id);
      }
    }
}