// SPDX-License-Identifier: UNLICENCED

/* Librairy LibErrors - Version Remix Compiler 0.8.18 OK : 27/05/2023 Edition 1.0
 * @title Error library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente des fonctions de traitement d'erreur
        et de test de valeurs contenues dans les variables passées en entrées
 */

pragma solidity ^0.8.11;

import "../utils/StringUtilsLib.sol";
//import "@openzeppelin/contracts/utils/Strings.sol";

/* Données de comptes */

library LibErrors {
    using StringUtilsLib for *;

    // Version 1.0.0 : library creation
    // Version 1.0.1 : add test minmax
    function beacon_LibErrors() public pure returns (string memory) { return "LibErrors::1.0.1"; }

    // Function notNull
    //
    function notNull( string memory _self, string memory _name)
    public pure returns (string memory) {
      if (_self.toSlice().empty()) revert( string.concat(_name, " is Null") );
      return _self;
      }
    // Function notNull
    //
    function notNull( bytes32 _self, string memory _name)
    public pure returns (bytes32) {
      if (_self == bytes32(0)) revert( string.concat(_name, " is Null") );
      return _self;
      }
    // Function notNull
    //
    function notNull( address _self, string memory _name)
    public pure returns (address) {
      if (_self == address(0)) revert( string.concat(_name, " is Null") );
      return _self;
      }
    // Function notNone
    //
    //function notNone( uint8 _self, string memory _name)
    //public pure returns (uint8) {
    //  if (_self == 0) revert( _name.toSlice().concat(" is Null".toSlice()) );
    //  return _self;
    //  }

    function notNone( uint256 _self, string memory _name)
    public pure returns (uint256) {
      if (_self == 0) revert( string.concat(_name, " is zero") );
      return _self;
      }
    // Function registered
    //
    function registered( bool _self, string memory _name)
    public pure returns (bool) {
      if (!_self) revert( string.concat(_name, " is unknown") );
      return _self;
      }
    // Function notRegistered
    //
    function notRegistered( bool _self, string memory _name)
    public pure returns (bool) {
      if (_self) revert( string.concat(_name, " is registered") );
      return !_self;
      }
    // Function mixMax
    //
    function inRange16( uint16 _self, uint16 _min, uint16 _max, string memory _name)
    public pure returns (uint16) {
      if ((_self >= _max) || (_self <= _min)) revert( string.concat(_name, " is out of range") );
      return _self;
      }

    }