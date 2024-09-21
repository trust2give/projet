// SPDX-License-Identifier: UNLICENCED

/* Librairy LibAccess - Version Remix Compiler 0.8.18 OK : 27/05/2023 Edition 1.0
 * @title Access library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente des fonctions de cnotrole d'accès aux fonctions
 */

pragma solidity ^0.8.11;

import "../AppStorage.sol";
import "../user/LibUsers.sol";
import "../general/LibStatus.sol";

enum AccessCode {
    NONE,
    USERSTATUS,
    USERROLE
    }

library LibAccess {
      using LibStatus for StatusLog;
      using LibUsers for UserStorage;

    error accessNotAllowed(AccessCode _code, address _name );

  function beacon_LibAccess() public pure returns (string memory) { return "LibAccess::1.0.0"; }

  /// @dev Get roles of an existing user
  /// @param _self stored AppStorage structure that contains user & parents
  /// @param _user @ETH for the given user
  /// @return _roles roles of the user
  function userRoles( AppStorage storage _self, address _user )
    public view returns (uint16 _roles) {
    (_roles, , ) = _self.users.currentRoles(_user);
    }

  /// @dev check whether the access to the function is allowed or not by the user based on their roles
  /// @param _self stored AppStorage structure that contains user objects
  /// @param _user @ETH address of the user to check access rights
  /// @param _allowed allowed roles to compare user's roles to
  /// @return bool if granted / otherwise error revert is thrown
  function isGranted( AppStorage storage _self, address _user, uint16 _allowed)
  public view returns (bool) {
    UserIdentity storage user = _self.users.isUser( _user );

    (uint16 roles, , ) = _self.users.currentRoles(_user);
    ( Status status, , ) = user.status.current();
    // Contrôle de cohérence sur le fait que l'utilisateur doit être en statut ACTIVE pour être
    // en mesure de faire des opérations.
    if (status != Status.ACTIVE) revert accessNotAllowed( AccessCode.USERSTATUS, _user );
    // On regarde si parmi la liste des roles déclarés pour le user, il y a au moins un qui est associé
    if ((roles & _allowed) == 0) revert accessNotAllowed( AccessCode.USERROLE, _user );
    return true;
    }

    }