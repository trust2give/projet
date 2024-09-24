// SPDX-License-Identifier: UNLICENCED

/* Librairy LibGains - Version Remix Compiler 0.8.18 : 02/08/2023 Edition 1.0
 * @title Status library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente des fonctions de gestion d'un statut d'objet
 */

pragma solidity ^0.8.11;

/* Type GainType
 * Liste les axes de réduction d'émission selon le modèle SBTi
 * et les recommandations des principes du NetZero Initiative
 */
enum GainType {
  NONE,
  REDUCTION,
  SEQUESTRATION,
  EVIT_PRODUIT,
  EVIT_CHAINE,
  EVIT_COMPENSATION
}

struct gainsObj {
  uint256 stamp;
  string tag;
  GainType value;
  }

struct GainsLog {
  uint256 nb;
  mapping(uint256 => gainsObj) gains;  
  }

/* Données de comptes */

library LibGains {

    function beacon_LibGains() public pure returns (string memory) { return "LibGains::1.0.0"; }

    function change(GainsLog storage _self, GainType _gains, string memory _tag) public {
      _self.gains[++_self.nb].value = _gains;
      _self.gains[_self.nb].tag = _tag;
      _self.gains[_self.nb].stamp = block.timestamp;
      }

    function current(GainsLog storage _self) public view returns (GainType _gains, uint256 _stamp, string memory _tag) {
      return (_self.gains[_self.nb].value, _self.gains[_self.nb].stamp, _self.gains[_self.nb].tag);
      }

    function previous(GainsLog storage _self, uint _rank) public view returns (GainType _gains, uint256 _stamp, string memory _tag) {
      return (_self.gains[_rank].value, _self.gains[_rank].stamp, _self.gains[_rank].tag);
      }

    function sizeOf(GainsLog storage _self) public view returns (uint256 _size) {
      return (_self.nb);
      }
    }