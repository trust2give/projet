// SPDX-License-Identifier: UNLICENCED

/* Librairy LibSources - Version Remix Compiler 0.8.18 OK : 27/05/2023 Edition 1.0
 * @title Sources library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente des types spécifique de sources de réduction de GES
 */

pragma solidity ^0.8.11;

/* ENUM Source de gain possibles
 * Classification des gains
 */

enum GainSource {
  NONE,
  PROCESS,
  PRODUCT,
  SUPPLIER,
  PROVIDER,
  EQUIPMENT,
  CONSUMPTION,
  TRANSPORT,
  OTHER }
// Librairie implémentant un journal de traçabilité des enregistrements


struct sourceObj {
  uint256 stamp;
  string tag;
  GainSource value;
  }

struct SourceLog {
  uint256 nb;
  mapping(uint256 => sourceObj) sources;  
  }

/* Données de comptes */

library LibSources {

    function beacon_LibSources() public pure returns (string memory) { return "LibSources::1.0.0"; }

    function change(SourceLog storage _self, GainSource _sources, string memory _tag) public {
      _self.sources[++_self.nb].value = _sources;
      _self.sources[_self.nb].tag = _tag;
      _self.sources[_self.nb].stamp = block.timestamp;
      }

    function current(SourceLog storage _self) public view returns (GainSource _gains, uint256 _stamp, string memory _tag) {
      return (_self.sources[_self.nb].value, _self.sources[_self.nb].stamp, _self.sources[_self.nb].tag);
      }

    function previous(SourceLog storage _self, uint _rank) public view returns (GainSource _gains, uint256 _stamp, string memory _tag) {
      return (_self.sources[_rank].value, _self.sources[_rank].stamp, _self.sources[_rank].tag);
      }

    function sizeOf(SourceLog storage _self) public view returns (uint256 _size) {
      return (_self.nb);
      }
    }



