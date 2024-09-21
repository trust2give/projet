// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

import "./HiveBase.sol";
import "../libraries/AppStorage.sol";
import "../libraries/LibTarget.sol";
//import "../libraries/LibRights.sol";

// Contrat Pollen
// Un Token Pollen

contract HiveTarget is HiveBase {
  //AppStorage internal s;

  constructor()  {
    }

  event TargetCreated(bytes32 _cpt);
  event TargetChanged(bytes32 _cpt, uint256 _id, uint256 _time);

  function initialize(
    address _user,
    TargetVersion memory _target
    )
    external
      noReentrancy(_user) {
      AppStorage storage s = LibStorage.appStorage();
      LibTarget.initTarget(s.userIdentity[_user].accountId, _target);
      }

  function newTarget(
    address _user,
    TargetVersion memory _target
    )
    external
      AllowedUser(_user, [ Profile.ADMIN, Profile.FINANCE, Profile.NONE, Profile.NONE] )
      noReentrancy(_user) {
      AppStorage storage s = LibStorage.appStorage();
      LibTarget.newTarget(s.userIdentity[_user].accountId, _target);
      }

  function currentTarget(
    address _user )
    external view
    AllowedUser(_user, [ Profile.BUSINESS, Profile.ADMIN, Profile.CERTIFY, Profile.FINANCE] )
    returns (TargetVersion memory _target) {
      AppStorage storage s = LibStorage.appStorage();
      return LibTarget.getActiveTarget(s.userIdentity[_user].accountId);
      }

  function readNthTarget(
    address _user,
    uint256 _id )
    external view
    AllowedUser(_user, [ Profile.BUSINESS, Profile.ADMIN, Profile.CERTIFY, Profile.FINANCE] )
    returns (TargetVersion memory _target) {
      AppStorage storage s = LibStorage.appStorage();
      return LibTarget.getNthTarget(s.userIdentity[_user].accountId, _id);
      }

}
