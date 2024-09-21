// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

// Librairie implémentant un journal de traçabilité des enregistrements

import "./AppStorage.sol";
import "./LibNektar.sol";
import "./LibPollen.sol";

// stamp(string) est au format "DYYYYMMDDHHMMSS"

library LibTransmut {

  event NektarTransmuted(address _cpt, bytes32 _nektar, bytes32 _cell);
  event NektarError(address _cpt, bytes32 _nektar, string _error);

  function Transmut(
    address _cpt,
    bytes32 _nektar,
    bytes32 _cell)
    public {
      //AppStorage storage s = LibStorage.appStorage();
      emit NektarTransmuted(_cpt, _nektar, _cell);
      }

  function cancelNektar(
    address _cpt,
    bytes32 _nektar)
    public {
      //AppStorage storage s = LibStorage.appStorage();
      emit NektarError(_cpt, _nektar, "Canceled Nektar");
      }
}
