// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

// Librairie implémentant un journal de traçabilité des enregistrements

import "./AppStorage.sol";

// stamp(string) est au format "DYYYYMMDDHHMMSS"

library LibCertify {

  event PollenCertified(bytes32 _cpt, bytes32 _pollen, uint256 _old, uint256 _new);
  event PollenError(bytes32 _cpt, bytes32 _pollen, string _error);

  modifier isCertifiable(
    bytes32 _cpt,
    bytes32 _pollen) {
      AppStorage storage s = LibStorage.appStorage();
      require( checkPollenIsInitialized(_cpt, _pollen, true), "Pollen not initialized");
      require( (s.polList[_cpt][_pollen].pollen.status == PollenStatus.POL_DRAFT), "Wrong Status");
      _;
      }

  modifier isCancelable(
    bytes32 _cpt,
    bytes32 _pollen) {
      AppStorage storage s = LibStorage.appStorage();
      require( checkPollenIsInitialized(_cpt, _pollen, true), "Pollen not initialized");
      require( (s.polList[_cpt][_pollen].pollen.status != PollenStatus.POL_GRANTED), "Wrong Status");
      _;
      }

  function ContainsPollen(
    bytes32 _cpt,
    bytes32 _pollen)
    public view
    returns (bool) {
      AppStorage storage s = LibStorage.appStorage();

      for (uint i = 1; i <= s.polBalance[_cpt].stockPOL; i++) {
        if (s.polIdList[_cpt][i] == _pollen) {
          return true;
          }
        }
      return false;
      }

  function checkPollenIsInitialized(
    bytes32 _cpt,
    bytes32 _pollen,
    bool _condition)
    private view
    returns (bool) {
      return (ContainsPollen(_cpt, _pollen) == _condition);
      }

  function switchStatusTo(
    bytes32 _cpt,
    bytes32 _pollen,
    PollenStatus _from,
    PollenStatus _to)
    private {
      AppStorage storage s = LibStorage.appStorage();

      // On recupere le statut actuel du Pollen
      PollenStatus _status  = s.polList[_cpt][_pollen].pollen.status;
      // on regarde que le statut actuel du pollen est bien celui indiqué
      // dans la variable _from sinon on revoit false
      if (_status == _from) {
        // on verifie que le nombre en stock de Pollen avec le statut _from
        require((s.polStock.POL[uint(_from)] > 0) &&
                (s.polBalance[_cpt].POL[uint(_from)] > 0), "Inconsistency");
        // On modifie le statut du pollen en le passant à _to
        s.polList[_cpt][_pollen].pollen.status = _to;
        // on decremente le nombre de pollen en statut _from
        s.polBalance[_cpt].POL[uint(_from)]--;
        s.polStock.POL[uint(_from)]--;
        // on incremente le nombre de pollen en statut _to
        s.polBalance[_cpt].POL[uint(_to)]++;
        s.polStock.POL[uint(_to)]++;

        transferTo(_cpt, _pollen, _from, _to);
        }
    }

  function transferTo(
    bytes32 _cpt,
    bytes32 _pollen,
    PollenStatus _from,
    PollenStatus _to)
    private {
      AppStorage storage s = LibStorage.appStorage();

      uint256 _qty  = s.polList[_cpt][_pollen].pollen.quantity;
      uint256 _tco  = s.polList[_cpt][_pollen].pollen.tco;
      // On recupere le statut actuel du Pollen
      s.polBalance[_cpt].co2[uint(_from)] -= _qty;
      s.polStock.co2[uint(_from)] -= _qty;
      s.polBalance[_cpt].co2[uint(_to)] += _qty;
      s.polStock.co2[uint(_to)] += _qty;
      s.polBalance[_cpt].tco[uint(_from)] -= _tco;
      s.polStock.tco[uint(_from)] -= _tco;
      s.polBalance[_cpt].tco[uint(_to)] += _tco;
      s.polStock.tco[uint(_to)] += _tco;

      s.polList[_cpt][_pollen].pollen.status = _to;
      emit PollenCertified(_cpt, _pollen, uint(_from), uint(_to));
      }

  function grantPollen(
    bytes32 _cpt,
    bytes32 _pollen)
    public isCertifiable( _cpt, _pollen ) {
      AppStorage storage s = LibStorage.appStorage();
      switchStatusTo( _cpt, _pollen,
                      s.polList[_cpt][_pollen].pollen.status,
                      PollenStatus.POL_GRANTED);
      }

  function cancelPollen(
    bytes32 _cpt,
    bytes32 _pollen)
    public isCancelable( _cpt, _pollen ) {
      AppStorage storage s = LibStorage.appStorage();
      switchStatusTo( _cpt, _pollen,
                      s.polList[_cpt][_pollen].pollen.status,
                      PollenStatus.POL_CANCELED);
      }

  function NewCertificate(
    bytes32 _cpt,
    bytes32 _pollen )
    internal pure
    returns (bytes32 _certificate) {
      //AppStorage storage s = LibStorage.appStorage();

      }

}
