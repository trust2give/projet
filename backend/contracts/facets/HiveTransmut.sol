// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

import "./HiveBase.sol";
import "../libraries/AppStorage.sol";
import "../libraries/LibTransmut.sol";

// Contrat Honey
// Un Token Honey

contract HiveTransmut is HiveBase {
  //AppStorage internal s;

  constructor()  {
    }

  function Transmut(
    bytes32 _nektar,
    bytes32 _cell)
    external
    noReentrancy(msg.sender) validIdentifier(_nektar) {
      LibTransmut.Transmut(msg.sender, _nektar, _cell);
      }

  function cancelNektar(
    bytes32 _nektar)
    external
    noReentrancy(msg.sender) validIdentifier(_nektar) {
      LibTransmut.cancelNektar(msg.sender, _nektar);
      }
}
