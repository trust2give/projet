// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;
//pragma experimental ABIEncoderV2;

/* Contract Mockup - Contrat de test pour librairies */

import "./libraries/AppStorage.sol";
import "./libraries/LibAccounts.sol";
import "./libraries/utils/StringUtilsLib.sol";

contract Mockup {
  AppStorage internal s;

  using LibAccounts for AppStorage;
  using LibUsers for UserStorage;
    using StringUtilsLib for *;

  event userModified(address _id);
  event entityCreated(bytes32 _id);
  event entityModified(bytes32 _id);

  constructor() {
    }

  function beacon_Mockup() public pure returns (string memory) { return "Mockup is alive!"; }

  function createEntity( EntityData calldata _data ) public returns (bytes32 _entity, string memory _error) {
    //EntityData memory none = EntityData( "Teamwork", "Owner La Ruche", "None", uint8(1), EntityType.GROUP, UnitType.ENTREPRISE);
    try s.newEntity( _data ) returns (bytes32 _e) {
      _entity = _e; 
      _error = "OK";
      } 
    catch Error(string memory _err) { // This is executed in case revert was called inside getData and a reason string was provided.
        _error = "Error ".toSlice().concat(_err.toSlice());
        } 
    catch Panic(uint) { // This is executed in case of a panic, i.e. a serious error like division by zero or overflow. The error code can be used to determine the kind of error.
        _error = "Panic";
        } 
    catch (bytes memory) { // This is executed in case revert() was used.
        _error = "Revert";
        }
    }

  function createUnit( UnitData calldata _data, bytes32 _parent ) public returns (bytes32 _unit) {
    return s.newUnit( _parent, _data );
    }

  function createUser( UserData calldata _data, bytes32 _parent ) public {
    s.newUser( _parent, _data );
    }

  function entity(bytes32 _id) public view returns (EntityData memory _data, Status _status, string memory _error) { 
    EntityData memory none = EntityData( "None", "None", "None", uint8(0), EntityType.NONE, UnitType.NONE);
    try s.readEntity( _id ) returns (EntityData memory _d, Status _s) {
      _data = _d;
      _status = _s; 
      _error = "OK";
      } 
    catch Error(string memory _err) { // This is executed in case revert was called inside getData and a reason string was provided.
        return (none, Status.INIT, "Error ".toSlice().concat(_err.toSlice()));
        } 
    catch Panic(uint) { // This is executed in case of a panic, i.e. a serious error like division by zero or overflow. The error code can be used to determine the kind of error.
        return (none, Status.INIT, "Panic");
        } 
    catch (bytes memory) { // This is executed in case revert() was used.
        return (none, Status.INIT, "Revert");
        }
    }

  function entity(string memory _name) public view returns (bytes32 _entity, string memory _error) { 
    try s.readEntity( _name ) returns (bytes32 _e) {
      _entity = _e; 
      _error = "OK";
      } 
    catch Error(string memory _err) { // This is executed in case revert was called inside getData and a reason string was provided.
        _error = "Error ".toSlice().concat(_err.toSlice());
        } 
    catch Panic(uint) { // This is executed in case of a panic, i.e. a serious error like division by zero or overflow. The error code can be used to determine the kind of error.
        _error = "Panic";
        } 
    catch (bytes memory) { // This is executed in case revert() was used.
        _error = "Revert";
        }
    }

  function unit(bytes32 _id) public view 
  returns (UnitData memory _data, Status _status) { 
    return s.readUnit( _id ); 
    }

  function user(address _id) public view returns (UserData memory _data, Status _status, string memory _error) { 
    UserData memory none = UserData( "None", "None", "@", "None", address(0), uint16(0));
    try s.readUser( _id ) returns (UserData memory _d, Status _s) {
      return (_d, _s, "OK" );
      } 
    catch Error(string memory _err) { // This is executed in case revert was called inside getData and a reason string was provided.
        return (none, Status.INIT, "Error ".toSlice().concat(_err.toSlice()));
        } 
    catch Panic(uint) { // This is executed in case of a panic, i.e. a serious error like division by zero or overflow. The error code can be used to determine the kind of error.
        return (none, Status.INIT, "Panic");
        } 
    catch (bytes memory) { // This is executed in case revert() was used.
        return (none, Status.INIT, "Revert");
        }
    }

  function changeEntity(EntityData calldata _data, bytes32 _id, string memory _tag) public { s.modifyEntity(_id, _data, _tag);}
  function changeUnit(UnitData calldata _data, bytes32 _id, string memory _tag) public { s.modifyUnit(_id, _data, _tag);}
  function changeUser(UserData calldata _data, address _id, string memory _tag) public { s.modifyUser(_id, _data, _tag);}

  function counts() public view returns (uint256 _entities, uint256 _units, uint256 _users) { return s.counts();  } 

  function activateUser( address _id, string calldata _tag ) public { s.activateUser( _id, _tag); }
  function activateUnit( bytes32 _id, string calldata _tag ) public { s.activateUnit( _id, _tag); }
  function activateEntity( bytes32 _id, string calldata _tag ) public { s.activateEntity( _id, _tag); }
  function freezeUser( address _id, string calldata _tag ) public { s.freezeUser( _id, _tag); }
  function freezeUnit( bytes32 _id, string calldata _tag ) public { s.freezeUnit( _id, _tag); }
  function freezeEntity( bytes32 _id, string calldata _tag ) public { s.freezeEntity( _id, _tag); }
  function closeUser( address _id, string calldata _tag ) public { s.closeUser( _id, _tag); }
  function closeUnit( bytes32 _id, string calldata _tag ) public { s.closeUnit( _id, _tag); }
  function closeEntity( bytes32 _id, string calldata _tag ) public { s.closeEntity( _id, _tag); }

  function getParents(address _id) public view returns (bytes32[] memory ) { return s.users.getParents(_id); }
  function getRoles(address _id) public view returns (uint16 _role, uint256 _stamp, string memory _tag) { return s.users.currentRoles(_id); }
  function tags(address _id, uint256 _rank) 
  public view returns (string memory _first, string memory _last, string memory _email, string memory _avatar, string memory _owner, string memory _status, string memory _role) {
    return s.users.tags(_id, _rank); 
    } 

  
}