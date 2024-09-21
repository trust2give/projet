// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;
//pragma experimental ABIEncoderV2;

/* Contract Mockup - Contrat de test pour librairies */

import "./HiveBase.sol";
import "../libraries/AppStorage.sol";
import "../libraries/LibAccounts.sol";
import "../libraries/LibRights.sol";
import "../libraries/company/LibEntities.sol";
import "../libraries/utils/StringUtilsLib.sol";

/**
 * @title HiveAccount
 * @dev Contract that implement functions to manage accounts ENTITY / UNIT / USER within Hive
 */

contract HiveAccount is HiveBase {

  using LibAccounts for AppStorage;
  using LibUsers for UserStorage;
  using StringUtilsLib for *;
  using LibRights for UserStorage;

  event userCreated(address _id);
  event entityCreated(bytes32 _id);
  event unitCreated(bytes32 _id);
  event accountModified(bytes32 _id, string _label);
  event userModified(address _id, string _label);
  event accountError(string _error);

  uint16 constant GRANTED_ACCOUNT = ROLE_ADMIN | ROLE_DELEGATE;

  constructor() {
    }

  /// @dev Beacon function that checks whether or not contract instance is deployed and accessible in the block chein
  /// @return if contract alive then "<ContractName> alive!" is returned
  function beacon_HiveAccount() public pure returns (string memory) { return "HiveAccount::1.0.0"; }

  /// @dev create a new ENTITY with mandatory data. Caller is to be either with ADMIN role or owner of Hive
  /// @param _data struct UnitData with init values
  function ACCcreateEntity( EntityData calldata _data ) public {
    if (s.users.accessGranted( msg.sender, GRANTED_ACCOUNT, (msg.sender == s.owner) )) {
      try s.readEntity(_data.name) returns (bytes32) { emit accountError("Entity already registered"); }
      catch { 
        try s.newEntity( _data ) returns (bytes32 _e) { emit entityCreated(_e); } 
        catch Error(string memory _err) { emit accountError(string.concat("Error ", _err)); } 
        catch Panic(uint _d) { emit accountError(string.concat("Panic", Strings.toString(_d))); } 
        catch (bytes memory _b) { emit accountError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b)))); }            
        }                
      }
    else emit accountError("Permission Denied");
    }

  /// @dev create a new UNIT with mandatory data and related to a ENTITY. Caller is to be either with ADMIN role or owner of Hive
  /// @param _data struct UnitData with init values
  /// @param _parent @ID of the ENTITY owner of the UNIT
  function ACCcreateUnit( UnitData calldata _data, bytes32 _parent ) public {
    if (s.users.accessGranted( msg.sender, GRANTED_ACCOUNT, (msg.sender == s.owner) )) {
      try s.newUnit( _parent, _data ) returns (bytes32 _e) { emit unitCreated(_e); } 
      catch Error(string memory _err) { emit accountError(string.concat("Error ", _err)); } 
      catch Panic(uint _d) { emit accountError(string.concat("Panic", Strings.toString(_d))); } 
      catch (bytes memory _b) { emit accountError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b)))); }            
      }
    else emit accountError("Permission Denied");
    }

  /// @dev create a new USER with mandatory data and related to a UNIT. Caller is to be either with ADMIN role or owner of Hive
  /// @param _data struct UserData with init values
  /// @param _parent @ID of the UNIT owner of the USER
  function ACCcreateUser( UserData calldata _data, bytes32 _parent ) public {
    if (s.users.accessGranted( msg.sender, GRANTED_ACCOUNT, (msg.sender == s.owner) )) {
      try s.newUser( _parent, _data ) { emit userCreated(_data.id); } 
      catch Error(string memory _err) { emit accountError(string.concat("Error ", _err)); } 
      catch Panic(uint _d) { emit accountError(string.concat("Panic", Strings.toString(_d))); } 
      catch (bytes memory _b) { emit accountError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b)))); }            
      }
    else emit accountError("Permission Denied");
    }

  /// @dev update editable fields of an existing ENTITY which has DRAFT Status (description, logo image)
  /// @param _entity @ID of the ENTITY to update
  /// @param _detail new description (or leave empty if no change)
  /// @param _logo new logo path (or leave empty if no change)
  /// @param _tag label for tagging the change operation
  function ACCupdateEntity(bytes32 _entity, string memory _detail, string memory _logo, string memory _tag ) public {  
    if (s.users.accessGranted( msg.sender, GRANTED_ACCOUNT, (msg.sender == s.owner) )) {
      try s.modifyEntity( _entity, _detail, _logo, _tag) { emit accountModified( _entity, "Entity"); } 
      catch Error(string memory _err) { emit accountError(string.concat("Error ", _err)); } 
      catch Panic(uint _d) { emit accountError(string.concat("Panic", Strings.toString(_d))); } 
      catch (bytes memory _b) {  emit accountError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b)))); }
      }
    else emit accountError("Permission Denied");
    }

  /// @dev update editable fields of an existing UNIT which has DRAFT Status (description, logo image & Contact)
  /// @param _unit @ID of the UNIT to update
  /// @param _detail new description (or leave empty if no change)
  /// @param _logo new logo path (or leave empty if no change)
  /// @param _contact new contact name (or leave empty if no change)
  /// @param _tag label for tagging the change operation
  function ACCupdateUnit(bytes32 _unit, string memory _detail, string memory _logo, string memory _contact, string memory _tag ) public {  
    if (s.users.accessGranted( msg.sender, GRANTED_ACCOUNT, (msg.sender == s.owner) )) {
      try s.modifyUnit( _unit, _detail, _logo, _contact, _tag) { emit accountModified( _unit, "Unit"); } 
      catch Error(string memory _err) { emit accountError(string.concat("Error ", _err)); } 
      catch Panic(uint _d) { emit accountError(string.concat("Panic", Strings.toString(_d))); } 
      catch (bytes memory _b) {  emit accountError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b)))); }
      }
    else emit accountError("Permission Denied");
    }

  /// @dev update editable fields of an existing USER which has DRAFT or ACTIVE Status
  /// @param _user @ID of the USER to update
  /// @param _last last name to be modified
  /// @param _first first name to be modified
  /// @param _email emailto be modified
  /// @param _avatar avatar image path to be modified
  /// @param _tag label for tagging the change operation
  function ACCupdateUser(address _user, string memory _last, string memory _first, string memory _email, string memory _avatar, string memory _tag ) public {  
    if (s.users.accessGranted( msg.sender, GRANTED_ACCOUNT, (msg.sender == s.owner) )) {
      try s.modifyUser( _user, _last, _first, _email, _avatar, _tag) { emit userModified( _user, "User"); } 
      catch Error(string memory _err) { emit accountError(string.concat("Error ", _err)); } 
      catch Panic(uint _d) { emit accountError(string.concat("Panic", Strings.toString(_d))); } 
      catch (bytes memory _b) {  emit accountError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b)))); }
      }
    else emit accountError("Permission Denied");
    }

  /// @dev read an existing ENTITY and get data from its @ID
  /// @param _id @ID of the ENTITY to read
  /// @return _data data of the ENTITY
  /// @return _status status of the ENTITY
  /// @return _error Status of result "OK" if succeeded or error code otherwise
  function ACCreadEntityFromId(bytes32 _id) public view returns (EntityData memory _data, Status _status, string memory _error) { 
    EntityData memory none = EntityData( "None", "None", "None", uint8(0), EntityType.NONE, UnitType.NONE);
    try s.readEntity( _id ) returns (EntityData memory _d, Status _s) { return (_d, _s, "OK" ); } 
    catch Error(string memory _err) { return (none, Status.INIT, string.concat("Error ", _err)); } 
    catch Panic(uint _d) { return (none, Status.INIT, string.concat("Panic", Strings.toString(_d))); } 
    catch (bytes memory _b) { return (none, Status.INIT, string(abi.encodePacked(bytes.concat(bytes("Revert"), _b)))); }
    }

  /// @dev get @ID an existing ENTITY and get data from its name
  /// @param _name name of the ENTITY to get @ID
  /// @return _entity @ID of the ENTITY
  /// @return _error Status of result "OK" if succeeded or error code otherwise
  function ACCreadentityIdFromName(string memory _name) public view returns (bytes32 _entity, string memory _error) { 
    try s.readEntity( _name ) returns (bytes32 _e) { return (_e, "OK" ); }
    catch Error(string memory _err) { _error = string.concat("Error ", _err); } 
    catch Panic(uint _d) { _error = string.concat("Panic", Strings.toString(_d)); } 
    catch (bytes memory _b) { _error = string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))); }
    }

  /// @dev read an existing UNIT and get data from its @ID
  /// @param _id @ID of the UNIT to read
  /// @return _data data of the UNIT
  /// @return _status status of the UNIT
  /// @return _error Status of result "OK" if succeeded or error code otherwise
  function ACCreadUnitFromId(bytes32 _id) public view returns (UnitData memory _data, Status _status, string memory _error) { 
    UnitData memory none = UnitData( "None", "None", "None", "None", "None", "None", uint8(0), UnitSize.NONE, EntityType.NONE, UnitType.NONE, BusSector.NONE );
    try s.readUnit( _id ) returns (UnitData memory _d, Status _s) { return (_d, _s, "OK" ); } 
    catch Error(string memory _err) { return (none, Status.INIT, string.concat("Error ", _err)); } 
    catch Panic(uint _d) { return (none, Status.INIT, string.concat("Panic", Strings.toString(_d))); } 
    catch (bytes memory _b) { return (none, Status.INIT, string(abi.encodePacked(bytes.concat(bytes("Revert"), _b)))); }
    }

  /// @dev get @ID an existing UNIT and get data from its siren / siret
  /// @param _siren siren of the UNIT to get @ID
  /// @param _siret siret of the UNIT to get @ID
  /// @return _unit @ID of the UNIT
  /// @return _error Status of result "OK" if succeeded or error code otherwise
  function ACCreadUnitIdFromName(string memory _siren, string memory _siret) public view returns (bytes32 _unit, string memory _error) { 
    try s.readUnit( _siren, _siret ) returns (bytes32 _e) { return (_e, "OK" ); }
    catch Error(string memory _err) { _error = string.concat("Error ", _err); } 
    catch Panic(uint _d) { _error = string.concat("Panic", Strings.toString(_d)); } 
    catch (bytes memory _b) { _error = string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))); }
    }

  /// @dev read an existing USER and get data from its @ETH
  /// @param _id @ETH of the USER to read
  /// @return _data data of the USER
  /// @return _status status of the USER
  /// @return _error Status of result "OK" if succeeded or error code otherwise
  function ACCreadUserFromAddress(address _id) public view returns (UserData memory _data, Status _status, string memory _error) { 
    UserData memory none = UserData( "None", "None", "@", "None", address(0), uint16(0));
    try s.readUser( _id ) returns (UserData memory _d, Status _s) { return (_d, _s, "OK" ); } 
    catch Error(string memory _err) { return (none, Status.INIT, string.concat("Error ", _err)); } 
    catch Panic(uint _d) { return (none, Status.INIT, string.concat("Panic", Strings.toString(_d))); } 
    catch (bytes memory _b) { return (none, Status.INIT, string(abi.encodePacked(bytes.concat(bytes("Revert"), _b)))); }
    }

  function dump(uint256 _rank) public view returns (string memory _d, uint256 _r, bytes32 _id) {
    AccountEntity storage account = s.entities.entity[_rank];
    _d = account.card.name.text[account.card.name.nb].content;
    _id = account.id.identity[account.id.nb].id;
    _r = s.entities.entityIndex[_id];
    }

  function counts() public view returns (uint256 _entities, uint256 _units, uint256 _users) { return s.counts();  } 

  function activateEntity( bytes32 _id, string calldata _tag ) public { 
    if (s.users.accessGranted( msg.sender, GRANTED_ACCOUNT, (msg.sender == s.owner) )) {
      try s.activateEntity( _id, _tag) { emit accountModified( _id, "Entity Active"); } 
      catch Error(string memory _err) { emit accountError(string.concat("Error ", _err)); } 
      catch Panic(uint _d) { emit accountError(string.concat("Panic", Strings.toString(_d))); } 
      catch (bytes memory _b) {  emit accountError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b)))); }
      }
    else emit accountError("Permission Denied");
    }

  function activateUnit( bytes32 _id, string calldata _tag ) public { 
    if (s.users.accessGranted( msg.sender, GRANTED_ACCOUNT, (msg.sender == s.owner) )) {
      try s.activateUnit( _id, _tag) { emit accountModified( _id, "Unit Active"); } 
      catch Error(string memory _err) { emit accountError(string.concat("Error ", _err)); } 
      catch Panic(uint _d) { emit accountError(string.concat("Panic", Strings.toString(_d))); } 
      catch (bytes memory _b) {  emit accountError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b)))); }
      }
    else emit accountError("Permission Denied");
    }

  function activateUser( address _id, string calldata _tag ) public { 
    if (s.users.accessGranted( msg.sender, GRANTED_ACCOUNT, (msg.sender == s.owner) )) {
      try s.activateUser( _id, _tag) { emit userModified( _id, "User Active"); } 
      catch Error(string memory _err) { emit accountError(string.concat("Error ", _err)); } 
      catch Panic(uint _d) { emit accountError(string.concat("Panic", Strings.toString(_d))); } 
      catch (bytes memory _b) {  emit accountError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b)))); }
      }
    else emit accountError("Permission Denied");
    }

  function freezeUser( address _id, string calldata _tag ) public { 
    if (s.users.accessGranted( msg.sender, GRANTED_ACCOUNT, (msg.sender == s.owner) )) {
      try s.freezeUser( _id, _tag) { emit userModified( _id, "User Frozen"); } 
      catch Error(string memory _err) { emit accountError(string.concat("Error ", _err)); } 
      catch Panic(uint _d) { emit accountError(string.concat("Panic", Strings.toString(_d))); } 
      catch (bytes memory _b) {  emit accountError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b)))); }
      }
    else emit accountError("Permission Denied");
    }

  function freezeUnit( bytes32 _id, string calldata _tag ) public { 
    if (s.users.accessGranted( msg.sender, GRANTED_ACCOUNT, (msg.sender == s.owner) )) {
      try s.freezeUnit( _id, _tag) { emit accountModified( _id, "Unit Frozen"); } 
      catch Error(string memory _err) { emit accountError(string.concat("Error ", _err)); } 
      catch Panic(uint _d) { emit accountError(string.concat("Panic", Strings.toString(_d))); } 
      catch (bytes memory _b) {  emit accountError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b)))); }
      }
    else emit accountError("Permission Denied");
    }

  function freezeEntity( bytes32 _id, string calldata _tag ) public { 
    if (s.users.accessGranted( msg.sender, GRANTED_ACCOUNT, (msg.sender == s.owner) )) {
      try s.freezeEntity( _id, _tag) { emit accountModified( _id, "Entity Frozen"); } 
      catch Error(string memory _err) { emit accountError(string.concat("Error ", _err)); } 
      catch Panic(uint _d) { emit accountError(string.concat("Panic", Strings.toString(_d))); } 
      catch (bytes memory _b) {  emit accountError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b)))); }
      }
    else emit accountError("Permission Denied");
    }

  function closeUser( address _id, string calldata _tag ) public { 
    if (s.users.accessGranted( msg.sender, GRANTED_ACCOUNT, (msg.sender == s.owner) )) {
      try s.closeUser( _id, _tag) { emit userModified( _id, "User Closed"); } 
      catch Error(string memory _err) { emit accountError(string.concat("Error ", _err)); } 
      catch Panic(uint _d) { emit accountError(string.concat("Panic", Strings.toString(_d))); } 
      catch (bytes memory _b) {  emit accountError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b)))); }
      }
    else emit accountError("Permission Denied");
    }

  function closeUnit( bytes32 _id, string calldata _tag ) public { 
    if (s.users.accessGranted( msg.sender, GRANTED_ACCOUNT, (msg.sender == s.owner) )) {
      try s.closeUnit( _id, _tag) { emit accountModified( _id, "Unit Closed"); } 
      catch Error(string memory _err) { emit accountError(string.concat("Error ", _err)); } 
      catch Panic(uint _d) { emit accountError(string.concat("Panic", Strings.toString(_d))); } 
      catch (bytes memory _b) {  emit accountError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b)))); }
      }
    else emit accountError("Permission Denied");
    }

  function closeEntity( bytes32 _id, string calldata _tag ) public { 
    if (s.users.accessGranted( msg.sender, GRANTED_ACCOUNT, (msg.sender == s.owner) )) {
      try s.closeEntity( _id, _tag) { emit accountModified( _id, "Entity Closed"); } 
      catch Error(string memory _err) { emit accountError(string.concat("Error ", _err)); } 
      catch Panic(uint _d) { emit accountError(string.concat("Panic", Strings.toString(_d))); } 
      catch (bytes memory _b) {  emit accountError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b)))); }
      }
    else emit accountError("Permission Denied");
    }

  function getParents(address _id) public view returns (bytes32[] memory ) { return s.users.getParents(_id); }
  function getRoles(address _id) public view returns (uint16 _role, uint256 _stamp, string memory _tag) { return s.users.currentRoles(_id); }
  function tags(address _id, uint256 _rank) 
  public view returns (string memory _first, string memory _last, string memory _email, string memory _avatar, string memory _owner, string memory _status, string memory _role) {
    return s.users.tags(_id, _rank); 
    } 

  
}