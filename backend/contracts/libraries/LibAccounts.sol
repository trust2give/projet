// SPDX-License-Identifier: UNLICENCED

/* Librairy LibAccounts - Version Remix Compiler 0.8.18 OK : 27/05/2023 Edition 1.0
 * @title Accounts library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente des fonctions de cnotrole d'accès aux fonctions
 */

pragma solidity ^0.8.11;

import "./AppStorage.sol";
import "./general/LibErrors.sol";
import "./user/LibUsers.sol";
import "./company/LibUnits.sol";
import "./company/LibEntities.sol";
import "./utils/StringUtilsLib.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

struct EntityData {
  string name;
  string detail;
  string logo;
  uint8 country;
  EntityType nature;
  UnitType uType;
  }

struct UnitData {
  string name;
  string detail;
  string siren;
  string siret;
  string logo;
  string contact;
  uint8 country;
  UnitSize size;
  EntityType nature;
  UnitType uType;
  BusSector sector;
  }

struct UserData {
  string last;
  string first;
  string email;
  string avatar;
  address id;
  uint16 role;
  }

library LibAccounts {

    using LibEntities for EntityStorage;
    using LibEntities for AccountEntity;
    using LibUnits for UnitStorage;
    using LibUsers for UserStorage;
    using LinkedListLib for LinkedListLib.LinkedList;
    using LibIdentifier for IdLog;
    using LibErrors for *;
    using StringUtilsLib for *;
    using LibAddress for AddressLog;

  error invalidStatus(string _var, bytes32 _id );

  // 1.0.1 : change modidyEntity from isDraft to isEditable
  // 1.0.2 : fix error on freezeEntity when no unit created
  // 1.0.3 : fix error on freezeEntity & CloseEntity when no unit is checked to freeze or close + modify freezeUnit & CloseUnit
  // 1.0.3 : fix error on freezeEntity & CloseEntity when no unit is checked to freeze or close + modify freezeUnit & CloseUnit
  function beacon_LibAccounts() public pure returns (string memory) { return "LibAccounts::1.0.4"; }

  /// @dev Create a new entity
  /// @param _self stored AppStorage structure that contains user & parents
  /// @param _data features of the entity
  /// @return _entity @ID for the given entity
  function newEntity( AppStorage storage _self, EntityData calldata _data ) external returns (bytes32 _entity) {
    _entity = _self.entities.initEntity( _data.name );
    _self.entities.setUpEntity( _entity, _data.country, _data.nature, _data.uType );
    _self.entities.changeDescription( _entity, _data.detail, "Root");
    _self.entities.changeLogo( _entity, _data.logo, "Root");
    }

  /// @dev Get details of an existing entity
  /// @param _self stored AppStorage structure that contains user & parents
  /// @param _entity @ID for the given entity
  /// @return _data features of the entity
  /// @return _status features of the unit
  function readEntity( AppStorage storage _self, bytes32 _entity )
    external view returns (EntityData memory _data, Status _status) {
    (_data.name, _data.detail, _status, _data.logo) = _self.entities.getEntity(_entity);    
    (_data.country, _data.nature, _data.uType) = _self.entities.getType(_entity);    
    }

  /// @dev Get details of an existing entity
  /// @param _self stored AppStorage structure that contains user & parents
  /// @param _name name for the given entity
  /// @return _entity @ID of the entity
  function readEntity( AppStorage storage _self, string memory _name )
    external view returns (bytes32 _entity) {
    _entity = _self.entities.isEntity(_name);
    }

  /// @dev Create a new unit from an existing entity
  /// @param _self stored AppStorage structure that contains user & parents
  /// @param _data features of the unit
  /// @return _unit @ID for the given unit
  function newUnit( AppStorage storage _self, bytes32 _parent, UnitData calldata _data ) external returns (bytes32 _unit) {
    // check if _parent is a valid entity
    if (_self.entities.isValid(_parent)) {
      _unit = _self.units.initUnit( _parent, _data.siren, _data.siret, _data.name );
      _self.units.setUpUnit( _unit, _data.country, _data.nature, _data.uType, _data.sector, _data.size );
      _self.units.changeDescription( _unit, _data.detail, "Root");
      _self.units.changeLogo( _unit, _data.logo, "Root");
      _self.units.changeContact( _unit, _data.contact, "Root");
      }
    }

  /// @dev Get details of an existing unit
  /// @param _self stored AppStorage structure that contains user & parents
  /// @param _unit @ID for the given unit
  /// @return _data features of the unit
  /// @return _status features of the unit
  function readUnit( AppStorage storage _self, bytes32 _unit )
    public view returns (UnitData memory _data, Status _status) {
    (_data.name, _data.detail, _data.siren, _data.siret, _status, _data.logo, _data.contact) = _self.units.getUnit(_unit);    
    (_data.country, _data.nature, _data.uType, _data.size, _data.sector) = _self.units.getType(_unit);    
    }

  /// @dev Get details of an existing unit
  /// @param _self stored AppStorage structure that contains user & parents
  /// @param _siren siren for the given unit
  /// @param _siret siret for the given unit
  /// @return _unit @ID of the unit
  function readUnit( AppStorage storage _self, string memory _siren, string memory _siret )
    external view returns (bytes32 _unit) {
    _unit = _self.units.isUnit(_siren, _siret);
    }

  /// @dev Create a new user from an existing unit
  /// @param _self stored AppStorage structure that contains user & parents
  /// @param _data features of the user
  function newUser( AppStorage storage _self, bytes32 _parent, UserData calldata _data ) external {
    // check if _parent is a valid entity
    if (_self.units.isValid(_parent)) {
      _self.users.initUser( _parent, _data.last, _data.first, _data.email,  _data.id, _data.role );
      _self.users.changeAvatar( _data.id, _data.avatar, "Root");
      }
    }

  /// @dev Get details of an existing user
  /// @param _self stored AppStorage structure that contains user & parents
  /// @param _user @ETH for the given user
  /// @return _data features of the user
  /// @return _status features of the user
  function readUser( AppStorage storage _self, address _user )
    external view returns (UserData memory _data, Status _status) {
    (_data.first, _data.last, _data.email, _status, _data.avatar) = _self.users.getIdentity(_user);    
    (_data.role, , ) = _self.users.currentRoles(_user);
    }

  /// @dev Get the number of objects registered (entities, units, users)
  /// @param _self stored AppStorage structure that contains user & parents
  /// @return _entities number of registered entities
  /// @return _units number of registered units
  /// @return _users number of registered users
  function counts( AppStorage storage _self ) public view returns (uint256 _entities, uint256 _units, uint256 _users) {
    _entities = _self.entities.counts();
    _units = _self.units.counts();
    _users = _self.users.counts();    
    }

  /// @dev change the values of an entity object who is not CLOSED
  /// @param _self stored AppStorage structure that contains user objects
  /// @param _id @ID of the entity to get identity features
  /// @param _detail description to be modified (description & logo)
  /// @param _logo logo path to be modified (description & logo)
  /// @param _tag Label to mark flag/identify the change
  function modifyEntity(AppStorage storage _self, bytes32 _id, string memory _detail, string memory _logo, string memory _tag) external {
    _tag.notNull( "Tag");
    EntityStorage storage entity = _self.entities.isEditable(_id);
    if (!_detail.toSlice().empty()) entity.changeDescription( _id, _detail, _tag);
    if (!_logo.toSlice().empty()) entity.changeLogo( _id, _logo, _tag);
    }

  /// @dev change the values of an unit object who is not CLOSED
  /// @param _self stored AppStorage structure that contains user objects
  /// @param _id @ID of the unit to get identity features
  /// @param _detail description to be modified (description & logo)
  /// @param _logo logo path to be modified (description & logo)
  /// @param _contact contact to be modified (description, contact & logo)
  /// @param _tag Label to mark flag/identify the change
  function modifyUnit(AppStorage storage _self, bytes32 _id, string memory _detail, string memory _logo, string memory _contact, string memory _tag) external {
    _tag.notNull( "Tag");
    UnitStorage storage unit = _self.units.isDraft(_id);
    if (!_detail.toSlice().empty()) unit.changeDescription( _id, _detail, _tag);
    if (!_logo.toSlice().empty()) unit.changeLogo( _id, _logo, _tag);
    if (!_contact.toSlice().empty()) unit.changeContact( _id, _contact, _tag);
    }

  /// @dev change the values of an user object who is not CLOSED
  /// @param _self stored AppStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @param _last last name to be modified
  /// @param _first first name to be modified
  /// @param _email emailto be modified
  /// @param _avatar avatar image path to be modified
  /// @param _tag Label to mark flag/identify the change
  function modifyUser(AppStorage storage _self, address _id, string memory _last, string memory _first, string memory _email, string memory _avatar, string memory _tag) external {
    _tag.notNull( "Tag");
    UserStorage storage user = _self.users.isDraft(_id);
    if (!_last.toSlice().empty() || !_first.toSlice().empty()) user.changeName( _id, _last, _first, _tag);
    if (!_email.toSlice().empty()) user.changeMail( _id, _email, _tag);
    if (!_avatar.toSlice().empty()) user.changeAvatar( _id, _avatar, _tag);
    }

  /// @dev activate one user depending of the ID passed
  /// @param _self stored AppStorage structure that contains user objects
  /// @param _user @ETH address of the user to get identity features
  /// @param _tag Label to mark flag/identify the change
  function activateUser(AppStorage storage _self, address _user, string memory _tag) public {
    _self.users.activate( _user, _tag );
    }

  /// @dev activate one unit depending of the ID passed, only if parent entity is already ACTIVE
  /// @param _self stored AppStorage structure that contains user objects
  /// @param _id @ID address of the user to get identity features
  /// @param _tag Label to mark flag/identify the change
  function activateUnit(AppStorage storage _self, bytes32 _id, string memory _tag) public {
    ( , , Status current, ) = _self.entities.getEntity( _self.units.getParent(_id) );
    if (current == Status.ACTIVE) _self.units.activate( _id, _tag );
    else revert invalidStatus( "Parent Status", _id);
    }

  /// @dev activate one entity depending of the ID passed
  /// @param _self stored AppStorage structure that contains user objects
  /// @param _id @ID address of the user to get identity features
  /// @param _tag Label to mark flag/identify the change
  function activateEntity(AppStorage storage _self, bytes32 _id, string memory _tag) external { _self.entities.activate( _id, _tag ); }

  /// @dev freeze one user depending of the ID passed
  /// @param _self stored AppStorage structure that contains user objects
  /// @param _user @ETH address of the user to get identity features
  /// @param _tag Label to mark flag/identify the change
  function freezeUser(AppStorage storage _self, address _user, string memory _tag) public {
    _self.users.freeze( _user, _tag );
    }

  /// @dev freeze one unit depending of the ID passed
  /// @param _self stored AppStorage structure that contains user objects
  /// @param _id @ID address of the user to get identity features
  /// @param _tag Label to mark flag/identify the change
  function freezeUnit(AppStorage storage _self, bytes32 _id, string memory _tag) public {
    LinkedListLib.LinkedList storage users = _self.users.usersFromUnit[_id];
    if (users.listExists() && users.sizeOf() > 0) {
      (bool exists, uint256 i) = users.getAdjacent( LinkedListLib.HEAD, LinkedListLib.NEXT);

      while (i != LinkedListLib.HEAD) {
        (address id, , ) = _self.users.user[i].id.current();
        freezeUser( _self, id, _tag );
        (exists,i) = users.getAdjacent( i, LinkedListLib.NEXT);
        }
      }
    _self.units.freeze( _id, _tag );
    }

  /// @dev freeze one entity depending of the ID passed (and subsequently all units related to it)
  /// @param _self stored AppStorage structure that contains user objects
  /// @param _id @ID address of the user to get identity features
  /// @param _tag Label to mark flag/identify the change
  function freezeEntity(AppStorage storage _self, bytes32 _id, string memory _tag) external {
    LinkedListLib.LinkedList storage units = _self.units.unitsFromEntity[_id];
    if (units.listExists() && units.sizeOf() > 0) {
      (bool exists, uint256 i) = units.getAdjacent( LinkedListLib.HEAD, LinkedListLib.NEXT);

      while (i != LinkedListLib.HEAD) {
        (bytes32 id, , ) = _self.units.unit[i].id.current();
        freezeUnit( _self, id, _tag );
        (exists,i) = units.getAdjacent( i, LinkedListLib.NEXT);
        }
      }
    _self.entities.freeze( _id, _tag );
    }

  /// @dev close one user depending of the ID passed
  /// @param _self stored AppStorage structure that contains user objects
  /// @param _user @ETH address of the user to get identity features
  /// @param _tag Label to mark flag/identify the change
  function closeUser(AppStorage storage _self, address _user, string memory _tag) public {
    _self.users.close( _user, _tag );
    }

  /// @dev close one unit depending of the ID passed
  /// @param _self stored AppStorage structure that contains user objects
  /// @param _id @ID address of the user to get identity features
  /// @param _tag Label to mark flag/identify the change
  function closeUnit(AppStorage storage _self, bytes32 _id, string memory _tag) public {
    LinkedListLib.LinkedList storage users = _self.users.usersFromUnit[_id];
    if (users.listExists() && users.sizeOf() > 0) {
      (bool exists, uint256 i) = users.getAdjacent( LinkedListLib.HEAD, LinkedListLib.NEXT);

      while (i != LinkedListLib.HEAD) {
        (address id, , ) = _self.users.user[i].id.current();
        closeUser( _self, id, _tag );
        (exists,i) = users.getAdjacent( i, LinkedListLib.NEXT);
        }
      }
    _self.units.close( _id, _tag );
    }

  /// @dev close one entity depending of the ID passed (and subsequently all units related to it)
  /// @param _self stored AppStorage structure that contains user objects
  /// @param _id @ID address of the user to get identity features
  /// @param _tag Label to mark flag/identify the change
  function closeEntity(AppStorage storage _self, bytes32 _id, string memory _tag) external {
    LinkedListLib.LinkedList storage units = _self.units.unitsFromEntity[_id];
    if (units.listExists()) {
      (bool exists, uint256 i) = units.getAdjacent( LinkedListLib.HEAD, LinkedListLib.NEXT);

      while (i != LinkedListLib.HEAD) {
        (bytes32 id, , ) = _self.units.unit[i].id.current();
        closeUnit( _self, id, _tag );
        (exists,i) = units.getAdjacent( i, LinkedListLib.NEXT);
        }
      }
    _self.entities.close( _id, _tag );
    }
    // Function isGranted
    //

/*    function isGranted( address _user, Profile _allowed)
    public view returns (bool) {
      revert accessNotAllowed( AccessCode.USERROLE, _user );
      }*/

  
    }