// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

/* Librairy LibUsers - Version Remix Compiler 0.8.18 OK : 27/05/2023 Edition 1.0
 * @title Users library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente l'objet AccountUser et ses fonctions associées
 */

import "../general/LibErrors.sol";
import "../general/LibUserCard.sol";
import "../general/LibAddress.sol";
import "../general/LibRoles.sol";
import "../general/LibStatus.sol";
import "../utils/LinkedListLib.sol";
import "../utils/StringUtilsLib.sol";

struct UserIdentity {
  UserCard card;    // User's identity card features
  StatusLog status; // Lifecycle status of the user inside La Ruche
  AddressLog id;    // @ETH address of the user's wallet
  RolesLog role;    // Roles applied to a user
  bytes32[] parent; // list of parent units (bytes32 identifiers) that a user is related to
  }

struct UserStorage {
  uint256 nbUsers;  // Number of registered user (regardless status)
  mapping(uint256  => UserIdentity) user;
  mapping(address => uint256) userIndex;
  mapping(bytes32 => LinkedListLib.LinkedList) usersFromUnit;  
  // Maaping locked : empècue une même @ETH d'appeler simultanément plus d'une fonction / smartcontract
  // L'appel aux fonctions à partir d'un compte se fait de façon séquentielle et une à la fois
  mapping(address => bool) locked;
  }


// Librairie implémentant un journal de traçabilité des enregistrements
library LibUsers {

  using LibUserCard for UserCard;
  using LibAddress for AddressLog;
  using LibRoles for RolesLog;
  using LibStatus for StatusLog;
  using LibErrors for *;
  using LinkedListLib for LinkedListLib.LinkedList;
  using StringUtilsLib for *;

  event userModified(address _id);

  function beacon_LibUsers() public pure returns (string memory) { return "LibUsers::1.0.0"; }

  function isDraft(UserStorage storage _self, address _id) external view returns (UserStorage storage) {
    LibErrors.registered( ((_self.nbUsers > 0) && (_self.userIndex[_id.notNull( "Id" )] > 0)), "User");
    (  Status current, ,) = _self.user[_self.userIndex[_id]].status.current(); 
    if (current != Status.DRAFT && current != Status.ACTIVE) revert("User not editable");
    return _self;
    }

  /// @dev lock a specific user to prevent concurrent access to the same calling function
  /// @param _self stored UserStorage structure that contains user objects
  /// @param _id @ETH address of the user to lock access to functions
  function lock(UserStorage storage _self, address _id) public { 
    _self.locked[_id.notNull( "Id" )] = true; 
    }

  /// @dev unlock a specific user to prevent concurrent access to the same calling function
  /// @param _self stored UserStorage structure that contains user objects
  /// @param _id @ETH address of the user to unlock access to functions
  function unlock(UserStorage storage _self, address _id) public { 
    _self.locked[_id.notNull( "Id" )] = true; 
    }

  /// @dev check if a specific user is registered or not
  /// @param _self stored UserStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @return _user - the pointer to the user object, ptherwise revert error event
  function isUser(UserStorage storage _self, address _id) public view returns (UserIdentity storage _user) {
    LibErrors.registered( ((_self.nbUsers > 0) && (_self.userIndex[_id.notNull( "Id" )] > 0)), "User");
    _user = _self.user[_self.userIndex[_id]];
    }

  /// @dev return the total number of registered users
  /// @param _self stored UserStorage structure that contains user objects
  /// @return utin256 - the total number of registered users, regardless their status
  function counts(UserStorage storage _self) public view returns (uint256) { return (_self.nbUsers); }

  /// @dev return the Nth tags for each feature of the user description
  /// @param _self stored UserStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @param _rank Nth tag for each feature to fetch
  /// @return _first - the Nth tag for first name
  /// @return _last - the Nth tag for first name
  /// @return _email - the Nth tag for first name
  /// @return _avatar - the Nth tag for first name
  /// @return _owner - the Nth tag for first name
  function tags(UserStorage storage _self, address _id, uint256 _rank) 
    public view 
    returns (string memory _first, string memory _last, string memory _email, string memory _avatar, string memory _owner, string memory _status, string memory _role) { 
    UserIdentity storage user = isUser( _self, _id);
    (_first, _last, _email, _avatar, _owner) = user.card.Tags(_rank);
    ( , ,_status) = user.status.current(); 
    ( , ,_role) = user.role.current(); 
    }

  /// @dev Add a specfic parent unit to a user who is not CLOSED
  /// @param _self stored UserStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @param _parent Bytes32 identifier of the parent unit to bind
  function addParent(UserStorage storage _self, address _id, bytes32 _parent) public {
    UserIdentity storage user = isUser( _self, _id);
    (Status current, , ) = user.status.current();
    if (current != Status.CLOSED) {
      if (user.parent.length == 0) user.parent = new bytes32[](0);
      uint8 i = 0;
      bool found = false;
      while (i < user.parent.length && !found) {
        found = (user.parent[i] == _parent) ? true : false;
        i++;
        }
      if (!found) {
        user.parent.push(_parent);
        _self.usersFromUnit[_parent].push( _self.userIndex[_id], true);
        emit userModified(_id);
        }
      }
    }

  /// @dev Remove specfic parent unit from a user who is not CLOSED
  /// @param _self stored UserStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @param _parent Bytes32 identifier of the parent unit to unbind
  function removeParent(UserStorage storage _self, address _id, bytes32 _parent) public {
    UserIdentity storage user = isUser( _self, _id);
    (Status current, , ) = user.status.current();
    if (current != Status.CLOSED) {
      // On fait une copie de la liste
      bytes32[] memory oldParent = user.parent;
      delete user.parent;
      user.parent = new bytes32[](0);
      for (uint8 i = 0; i < oldParent.length; i++) {
        if (oldParent[i] != _parent) user.parent.push(oldParent[i]);
        }
      _self.usersFromUnit[_parent].remove( _self.userIndex[_id]);
      emit userModified(_id);
      }
    }

  /// @dev returns the parents related to the user
  /// @param _self stored UserStorage structure that contains user & parents list
  /// @param _id @ETH address of the user to get the parents from
  /// @return _parent Array of bytes32 (parent's id) for the given user
  function getParents(UserStorage storage _self, address _id) public view returns (bytes32[] memory _parent) {
    UserIdentity storage user = isUser( _self, _id);
    _parent = user.parent;
    }

  /// @dev change the first & last names of a user who is not CLOSED
  /// @param _self stored UserStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @param _last role to set for the user (uint16 flags --see LibRoles for details)
  /// @param _first role to set for the user (uint16 flags --see LibRoles for details)
  /// @param _tag Label to mark flag/identify the change
  function changeName(UserStorage storage _self, address _id, string memory _last, string memory _first, string memory _tag) public {
    _tag.notNull( "Tag");
    UserIdentity storage user = isUser( _self, _id);
    (Status current, , ) = user.status.current();
    if (current != Status.CLOSED) {
      if (!_last.toSlice().empty()) user.card.LastName( _last, _tag );
      if (!_first.toSlice().empty()) user.card.FirstName( _first, _tag );
      emit userModified(_id);
      }
    }

  /// @dev change the email address of a user who is not CLOSED
  /// @param _self stored UserStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @param _email role to set for the user (uint16 flags --see LibRoles for details)
  /// @param _tag Label to mark flag/identify the change
  function changeMail(UserStorage storage _self, address _id, string memory _email, string memory _tag) public {
    _tag.notNull( "Tag");
    UserIdentity storage user = isUser( _self, _id);
    (Status current, , ) = user.status.current();
    if (current != Status.CLOSED) {
      if (!_email.toSlice().empty()) user.card.Email( _email, _tag );
      emit userModified(_id);
      }
    }

  /// @dev change the avatar image of a user who is not CLOSED
  /// @param _self stored UserStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @param _avatar role to set for the user (uint16 flags --see LibRoles for details)
  /// @param _tag Label to mark flag/identify the change
  function changeAvatar(UserStorage storage _self, address _id, string memory _avatar, string memory _tag) public {
    _tag.notNull( "Tag");
    UserIdentity storage user = isUser( _self, _id);
    (Status current, , ) = user.status.current();
    if (current != Status.CLOSED) {
      if (!_avatar.toSlice().empty()) user.card.Avatar( _avatar, _tag );
      emit userModified(_id);
      }
    }

  /// @dev Set specfic roles to a user who is not CLOSED
  /// @param _self stored UserStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @param _role role to set for the user (uint16 flags --see LibRoles for details)
  /// @param _tag Label to mark flag/identify the change
  function addRole(UserStorage storage _self, address _id, uint16 _role, string memory _tag) public {
    _tag.notNull( "Tag");
    UserIdentity storage user = isUser( _self, _id);
    (Status current, , ) = user.status.current();
    if (current != Status.CLOSED) {
      user.role.add( _role, _tag );
      emit userModified(_id);
      }
    }

  /// @dev Unset specfic roles to a user who is not CLOSED
  /// @param _self stored UserStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @param _role role to clear for the user (uint16 flags --see LibRoles for details)
  /// @param _tag Label to mark flag/identify the change
  function clearRole(UserStorage storage _self, address _id, uint16 _role, string memory _tag) public {
    _tag.notNull( "Tag");
    UserIdentity storage user = isUser( _self, _id);
    (Status current, , ) = user.status.current();
    if (current != Status.CLOSED) {
      _self.user[_self.userIndex[_id]].role.remove( _role, _tag );
      emit userModified(_id);
      }
    }

  /// @dev returns the current roles related to the user
  /// @param _self stored UserStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @return _role for the given user - (Roles is an uint16 flags --see LibRoles for details)
  /// @return _stamp 
  /// @return _tag  
  function currentRoles(UserStorage storage _self, address _id) public view returns (uint16 _role, uint256 _stamp, string memory _tag) {
    UserIdentity storage user = isUser( _self, _id);
    return user.role.current();
    }

  /// @dev Create & initialize a new user with preliminary data. Inital Tag is "Root"
  /// @param _self stored UserStorage structure that contains user & parents list
  /// @param _parent Bytes32 identifier of the parent unit to relate to
  /// @param _last last name of the user
  /// @param _first first name of the user
  /// @param _email email address of the user
  /// @param _id @ETH address of the user to get the parents from
  /// @param _role role of the user (uint16 flags --see LibRoles for details)
  function initUser(UserStorage storage _self, bytes32 _parent, 
                    string calldata _last, string calldata _first, 
                    string calldata _email, address _id, uint16 _role )
    public {
      LibErrors.notRegistered( ((_self.nbUsers > 0) && (_self.userIndex[_id.notNull( "Id" )] > 0)), "User");
      _last.notNull( "Last Name");
      _first.notNull( "First Name");
      _email.notNull( "Email");
      _parent.notNull( "Unit");
      //uint8(_role).notNone( "Role");

      _self.userIndex[_id] =  ++_self.nbUsers;
      _self.user[_self.nbUsers].id.create( _id, "Root" );
      _self.user[_self.nbUsers].card.create( _last, _first, _email );
      _self.user[_self.nbUsers].status.change( Status.DRAFT, "Root" );  
      _self.user[_self.nbUsers].role.change( _role, "Root" );

      if (_self.user[_self.nbUsers].parent.length == 0) _self.user[_self.nbUsers].parent = new bytes32[](0);
      _self.user[_self.nbUsers].parent.push(_parent);
      _self.usersFromUnit[_parent].push( _self.nbUsers, true);
      }

  /// @dev returns the details related to the user
  /// @param _self stored UserStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @return _first for the given user
  /// @return _last for the given user
  /// @return _email for the given user
  /// @return _status for the given user
  /// @return _avatar for the given user
  function getIdentity(UserStorage storage _self, address _id) 
    public view 
    returns (string memory _first, string memory _last, string memory _email, Status _status, string memory _avatar) {
    UserIdentity storage user = isUser( _self, _id);
    (_first, _last, _email, _avatar,  ,  ) = user.card.current();
    (_status,  ,  ) = user.status.current();
    }

  /// @dev activate a specific registered user with already DRAFT or FROZEN status
  /// @param _self stored UserStorage structure that contains user object
  /// @param _id @ETH address of the user to activate
  function activate( UserStorage storage _self, address _id, string calldata _tag) public {
    UserIdentity storage user = isUser( _self, _id);
    (Status current, , ) = user.status.current();
    if (current == Status.FROZEN || current == Status.DRAFT) {
      user.status.change(Status.ACTIVE, _tag);
      emit userModified(_id);
      }
    }

  /// @dev freeze a specific registered user with already DRAFT or ACTIVE status
  /// @param _self stored UserStorage structure that contains user object
  /// @param _id @ETH address of the user to freeze
  function freeze( UserStorage storage _self, address _id, string calldata _tag) public {
    UserIdentity storage user = isUser( _self, _id);
    (Status current, , ) = user.status.current();
    if (current == Status.ACTIVE || current == Status.DRAFT) {
      user.status.change(Status.FROZEN, _tag);
      emit userModified(_id);
      }
    }

  /// @dev close a specific registered user with already DRAFT, FROZEN or ACTIVE status
  /// @param _self stored UserStorage structure that contains user object
  /// @param _id @ETH address of the user to close
  function close( UserStorage storage _self, address _id, string calldata _tag) public {
    UserIdentity storage user = isUser( _self, _id);
    (Status current, , ) = user.status.current();
    if (current != Status.CLOSED) {
      user.status.change(Status.CLOSED, _tag);
      emit userModified(_id);
      }
    }
}