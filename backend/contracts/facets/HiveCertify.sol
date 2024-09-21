// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

import "./HiveBase.sol";
import "../libraries/AppStorage.sol";
import "../libraries/LibCertify.sol";

// Contrat Pollen
// Un Token Pollen

contract HiveCertify is HiveBase {
  //AppStorage internal s;

  constructor()  {
    }

  event PollenUpdated(bytes32 _cpt, bytes32 _pollen, uint256 _old, uint256 _new);
  event PollenError(bytes32 _cpt, bytes32 _pollen, string _error);

  function Certify(
    bytes32 _pollen,
    address _user,
    bytes32 _cpt )
    external
    AllowedUser(_user, [ Profile.CERTIFY, Profile.NONE, Profile.NONE, Profile.NONE] )
    noReentrancy(_user) validIdentifier(_pollen) {
        LibCertify.grantPollen(_cpt, _pollen);
        }

  function Cancel(
    bytes32 _pollen,
    address _user,
    bytes32 _cpt )
    external
    AllowedUser(_user, [ Profile.BUSINESS, Profile.CERTIFY, Profile.NONE, Profile.NONE] )
    noReentrancy(_user) validIdentifier(_pollen) {
      LibCertify.cancelPollen(_cpt, _pollen);
    }
}
