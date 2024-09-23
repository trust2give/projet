// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

/* Contract HiveBase - Version Remix Compiler 0.8.18 OK : 27/05/2023 Edition 1.0
 * @title HiveBase contract for Hive Solution
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 * @dev Ce contract est un contrat de base pour tous les contrats qui souhaitent accéder à l'Appstorage et bénéficier de fonctione communes par héritage
 */

//import "../libraries/user/LibUsers.sol";
import "../libraries/AppStorage.sol";

contract HiveBase {
  AppStorage internal s;

  // modifier pour empécher un appel simultanné et parallèle de la même fonction
  // pad une même adresse.
  modifier noReentrancy(address _cpt) {
    require(!s.users.locked[_cpt], "No reentrancy");
    s.users.locked[_cpt] = true;
    _;
    s.users.locked[_cpt] = false;
    }

  constructor() {
    }
}
