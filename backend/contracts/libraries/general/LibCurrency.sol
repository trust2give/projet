// SPDX-License-Identifier: UNLICENCED

/* Librairy LibStatus - Version Remix Compiler 0.8.18 : 02/08/2023 Edition 1.0
 * @title Status library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente des fonctions de gestion d'un statut d'objet
 */

pragma solidity ^0.8.11;

//import "@openzeppelin/contracts/math/SafeMath.sol";


/* Type Currency 
 * Utilisé pour les unités monétaires pour les valorisation des tokens POLLEN, NEKTAR, CELL et HONEY
 * et pour les autres usages en général
 */

enum Currency {
  NONE,
  EURO,
  DOLLAR,
  SWISSFRANC,
  STERLINGPOUND,
  YEN,
  YUAN
}

struct currObj {
  uint256 stamp;
  string tag;
  Currency value;
  }

struct CurrencyLog {
  uint256 nb;
  mapping(uint256 => currObj) currency;  
  }

/* Données de comptes */

library LibCurrency {

    function beacon_LibCurrency() public pure returns (string memory) { return "LibCurrency::1.0.0"; }

    function change(CurrencyLog storage _self, Currency _currency, string memory _tag) public {
      _self.currency[++_self.nb].value = _currency;
      _self.currency[_self.nb].tag = _tag;
      _self.currency[_self.nb].stamp = block.timestamp;
      }

    function current(CurrencyLog storage _self) public view returns (Currency _currency, uint256 _stamp, string memory _tag) {
      return (_self.currency[_self.nb].value, _self.currency[_self.nb].stamp, _self.currency[_self.nb].tag);
      }

    function previous(CurrencyLog storage _self, uint _rank) public view returns (Currency _currency, uint256 _stamp, string memory _tag) {
      return (_self.currency[_rank].value, _self.currency[_rank].stamp, _self.currency[_rank].tag);
      }

    function sizeOf(CurrencyLog storage _self) public view returns (uint256 _size) {
      return (_self.nb);
      }

    function convert2euros( CurrencyLog storage _self, uint256 _amount ) view external returns (uint256 _converted) {
      if (_self.currency[_self.nb].value == Currency.EURO) _converted = _amount;
      if (_self.currency[_self.nb].value == Currency.DOLLAR) _converted = 90 * _amount / 100;
      if (_self.currency[_self.nb].value == Currency.SWISSFRANC) _converted = 130 * _amount / 100;
      if (_self.currency[_self.nb].value == Currency.STERLINGPOUND) _converted = 2 * _amount;
      if (_self.currency[_self.nb].value == Currency.YEN) _converted = _amount;
      if (_self.currency[_self.nb].value == Currency.YUAN) _converted = _amount;
      }

    }