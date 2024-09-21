// SPDX-License-Identifier: UNLICENCED

/* Librairy LibScope - Version Remix Compiler 0.8.18 : 02/08/2023 Edition 1.0
 * @title GHG reduction Scope library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente des fonctions de gestion des scope Bilan Carbone
 */

pragma solidity ^0.8.11;

/* Type GainScope
 * Liste des 23 axes d'émission de GES définis dans les Bilans Carbones
 */

uint8 constant MAX_GAINSCOPE = 24;

enum GainScope {
  NONE,
  S1_FIXE,
  S1_MOBILE,
  S1_PROCESS,
  S1_FUGITIVE,
  S1_BIOMASSE,
  S2_ELECTRICITY,
  S2_HEATCOLD,
  S3_UPSTREAMNRJ,
  S3_RAWPURCHASE,
  S3_AMMORTIZATION,
  S3_WASTES,
  S3_UPSTREAMSUPPLY,
  S3_TRAVELS,
  S3_UPSTREAMLEASING,
  S3_TBD2,
  S3_VISITORS,
  S3_DOWNSTREAMSUPPLY,
  S3_SALES,
  S3_ENDOFLIFE,
  S3_DOWNSTREAMFRANCHISE,
  S3_DOWNSTREAMLEASING,
  S3_TBD3,
  S3_TBD4 }

struct scopeObj {
  uint256 stamp;
  string tag;
  uint256[] quantity;
  }

struct ScopeLog {
  uint256 nb;
  mapping(uint256 => scopeObj) scope;  
  }

/* Données de comptes */

library LibScope {

    function beacon_LibScope() public pure returns (string memory) { return "LibScope::1.0.0"; }

    function change(ScopeLog storage _self, uint256[] memory _scope, string memory _tag) public {
      _self.scope[++_self.nb].quantity = _scope;
      _self.scope[_self.nb].tag = _tag;
      _self.scope[_self.nb].stamp = block.timestamp;
      }

    function current(ScopeLog storage _self) public view returns (uint256[] memory _scope, uint256 _stamp, string memory _tag) {
      return (_self.scope[_self.nb].quantity, _self.scope[_self.nb].stamp, _self.scope[_self.nb].tag);
      }

    function previous(ScopeLog storage _self, uint _rank) public view returns (uint256[] memory _scope, uint256 _stamp, string memory _tag) {
      return (_self.scope[_rank].quantity, _self.scope[_rank].stamp, _self.scope[_rank].tag);
      }

    function sizeOf(ScopeLog storage _self) public view returns (uint256 _size) {
      return (_self.nb);
      }
    }