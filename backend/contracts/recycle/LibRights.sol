// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

import "./general/LibErrors.sol";
import "./general/LibRoles.sol";
import "./AppStorage.sol";
import "./utils/LinkedListLib.sol";

enum GrantStatus {
  NONE,
  GRANTED,
  BANNED_ADDRESS,
  BANNED_UNIT,
  BANNED_STATUS,
  BANNED_ROLE,
  BANNED_POLLEN
} 

/**
 * @title LibRights
 * @dev Contract that implement access control functions for smartcontract of the Hive
 */


library LibRights {
  using LibErrors for *;
  using LibRoles for RolesLog;
  using LibStatus for StatusLog;
  using LibUsers for UserStorage;
  using LinkedListLib for LinkedListLib.LinkedList;
  using LibIdentifier for IdLog;

  /// @dev Beacon function that checks whether or not contract instance is deployed and accessible in the block chein
  /// @return if contract alive then "<ContractName> alive!" is returned
  function beacon_LibRights() public pure returns (string memory) { return "LibRights::1.0.0"; }

  /// @dev check if a user is granted right to access a function by checking roles & status (ACTIVE required)
  /// @param _self stored UserStorage structure that contains user objects
  /// @param _user @ETH address of the user to check access / role
  /// @param _roles roles of the user to check access / role
  /// @param _superuser bool that force the check to true is address is owner of Hive
  /// @return _granted bool True is access is granted, false otherwise
  function accessGranted(UserStorage storage _self, address _user, uint16 _roles, bool _superuser ) external view returns (bool _granted) {
    if (!_superuser) {
      (_self.userIndex[_user]).notNone("accessGranted::Address");
      UserIdentity storage user = _self.user[_self.userIndex[_user]];
      (uint16 roles, , ) = user.role.current();
      (Status current, , ) = user.status.current();
      _granted = ((current == Status.ACTIVE) && ((roles & _roles) > 0));
      }
    else _granted = _superuser;
    }

  /// @dev check if a user is granted right to access a function by checking parent unit, roles & status (ACTIVE required)
  /// @param _self stored UserStorage structure that contains user objects
  /// @param _user @ETH address of the user to check access / role
  /// @param _unit @ID of the _unit to check
  /// @param _roles roles of the user to check access / role
  /// @param _superuser bool that force the check to true is address is owner of Hive
  /// @return _granted GrantStatus value for access granted or not otherwise
  function accessGranted(UserStorage storage _self, address _user, bytes32 _unit, uint16 _roles, bool _superuser ) external view returns (GrantStatus _granted) {
    if (!_superuser) {
      if (_self.userIndex[_user] == 0) return GrantStatus.BANNED_ADDRESS;

      UserIdentity storage user = _self.user[_self.userIndex[_user]];
      bytes32[] memory units = _self.getParents(_user);
      (uint16 roles, , ) = _self.currentRoles(_user);
      (Status current, , ) = user.status.current();

      bool found = false;
      for (uint rank = 0; rank < units.length; rank++) { found = found || (units[rank] == _unit); }
      if (!found) return GrantStatus.BANNED_UNIT;
      if (current != Status.ACTIVE) return GrantStatus.BANNED_STATUS;
      if ((roles & _roles) == 0) return GrantStatus.BANNED_ROLE;
      }
    return GrantStatus.GRANTED;
    }

  /// @dev check if a user is granted right to access a POLLEN by checking parent unit, roles & status (ACTIVE required)
  /// @param _self stored UserStorage structure that contains user objects
  /// @param _user @ETH address of the user to check access / role
  /// @param _pollen @ID of the POLLEN to check
  /// @param _roles roles of the user to check access / role
  /// @param _superuser bool that force the check to true is address is owner of Hive
  /// @return _granted GrantStatus value for access granted or not otherwise
  function accessPollenGranted(AppStorage storage _self, address _user, bytes32 _pollen, uint16 _roles, bool _superuser ) external view returns (GrantStatus _granted) {
    if (_superuser) return GrantStatus.GRANTED;
    if (_self.users.userIndex[_user] == 0) return GrantStatus.BANNED_ADDRESS;

    UserIdentity storage user = _self.users.user[_self.users.userIndex[_user]];
    bytes32[] memory units = _self.users.getParents(_user);

    (uint16 roles, , ) = _self.users.currentRoles(_user);
    (Status current, , ) = user.status.current();
    if (current != Status.ACTIVE) return GrantStatus.BANNED_STATUS;
    if ((roles & _roles) == 0) return GrantStatus.BANNED_ROLE;

    for (uint rank = 0; rank < units.length; rank++) { 
      LinkedListLib.LinkedList storage pollens = _self.pollens.pollenFromUnit[units[rank]];
      if (pollens.listExists()) {
        if (pollens.sizeOf() > 0) {
          (bool valid, uint256 i) = pollens.getAdjacent( LinkedListLib.HEAD, LinkedListLib.NEXT);
          while (i != LinkedListLib.HEAD) {
            (bytes32 id, , ) = _self.pollens.pollen[i].id.current();
            if (id == _pollen) return GrantStatus.GRANTED;
            (valid,i) = pollens.getAdjacent( i, LinkedListLib.NEXT);
            }
          } 
        }
      }
    return GrantStatus.BANNED_POLLEN; // None Pollen to address
    }

  /// @dev check if a user is granted right to access a POLLEN by checking parent unit, roles & status (ACTIVE required)
  /// @param _self stored UserStorage structure that contains user objects
  /// @param _user @ETH address of the user to check access / role
  /// @param _nektar @ID of the NEKTAR to check
  /// @param _roles roles of the user to check access / role
  /// @param _superuser bool that force the check to true is address is owner of Hive
  /// @return _granted GrantStatus value for access granted or not otherwise
  function accessNektarGranted(AppStorage storage _self, address _user, bytes32 _nektar, uint16 _roles, bool _superuser ) external view returns (GrantStatus _granted) {
    if (_superuser) return GrantStatus.GRANTED;
    if (_self.users.userIndex[_user] == 0) return GrantStatus.BANNED_ADDRESS;

    UserIdentity storage user = _self.users.user[_self.users.userIndex[_user]];
    bytes32[] memory units = _self.users.getParents(_user);

    (uint16 roles, , ) = _self.users.currentRoles(_user);
    (Status current, , ) = user.status.current();
    if (current != Status.ACTIVE) return GrantStatus.BANNED_STATUS;
    if ((roles & _roles) == 0) return GrantStatus.BANNED_ROLE;

    for (uint rank = 0; rank < units.length; rank++) { 
      LinkedListLib.LinkedList storage nektars = _self.nektars.nektarFromUnit[units[rank]];
      if (nektars.listExists()) {
        if (nektars.sizeOf() > 0) {
          (bool valid, uint256 i) = nektars.getAdjacent( LinkedListLib.HEAD, LinkedListLib.NEXT);
          while (i != LinkedListLib.HEAD) {
            (bytes32 id, , ) = _self.nektars.nektar[i].id.current();
            if (id == _nektar) return GrantStatus.GRANTED;
            (valid,i) = nektars.getAdjacent( i, LinkedListLib.NEXT);
            }
          } 
        }
      }
    return GrantStatus.BANNED_POLLEN; // None Pollen to address
    }

}
