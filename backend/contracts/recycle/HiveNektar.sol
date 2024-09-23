// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

import "./HiveBase.sol";
import "../libraries/AppStorage.sol";
import "../libraries/LibRights.sol";
import "../libraries/pollen/LibPollenSts.sol";
import "../libraries/pollen/LibPollenSet.sol";
import "../libraries/nektar/LibNektarQty.sol";
import "../libraries/nektar/LibNektarSet.sol";
import "../libraries/nektar/LibNektarSts.sol";

/**
 * @title HiveNektar
 * @dev Contract that implement functions to manage accounts NEKTAR Token Hive.
 * @dev NEKTAR Token represent and qualify effective GHG reduction quantities between to successive GHG Reports (Two POLLEN)
 */

contract HiveNektar is HiveBase {
    using LibNektarQty for NektarStorage;
    using LibPollenSts for PollenStorage;
    using LibPollenSet for PollenStorage;
    using LibPollenData for PollenStorage;
    using LibNektarSts for NektarStorage;
    using LibNektarSet for NektarStorage;
    using LibNektarData for NektarStorage;
    using StringUtilsLib for *;
    using LibCurrency for CurrencyLog;
    using LibValue for ValueLog;
    using LibScale for ScaleLog;
    using LibRights for AppStorage;
    using LibRights for UserStorage;

    constructor() {}

    event nektarRecorded(bytes32 _id, address _user);
    event nektarUpdated(bytes32 _id, string _label, address _user);
    event nektarError(string _error, address _user);

    uint16 constant GRANTED_NEKTAR = ROLE_ADMIN | ROLE_CERTIFIER | ROLE_DELEGATE;

    // Version 1.0.1 : version initiale
    function beacon_HiveNektar() public pure returns (string memory) { return "HiveNektar::1.0.1"; }

    /// @dev create a new NEKTAR with mandatory data
    /// @param _data struct NektarData with mandatory initial values ( name, from, to, parent ) and optional values (details, source, logo).
    function NKTNew(NektarData memory _data) public {
        GrantStatus grant = s.users.accessGranted( msg.sender, _data.parent, GRANTED_NEKTAR, (msg.sender == s.owner) );
        if (grant == GrantStatus.GRANTED) {
            // First check the eligibility of the POLLENS
            try s.pollens.isEligibleForNektar(_data.from, _data.to) returns ( uint16 _period, uint16 _start ) { 
              _data.period = _period;
              _data.start = _start;
                try s.pollens.getDelta(_data.from, _data.to) returns ( uint256 _tco, uint256 _total, UnitScale _scale, Currency _currency ) {
                  _data.tco = _tco;
                  _data.quantity = _total;
                  _data.scale = _scale;
                  _data.currency = _currency;
                  // Check successful. We can create the new NEKTAR
                  try s.nektars.initNektar(_data) returns (bytes32 _id) {
                      // Now we need to BIND POLLEN and change their status
                      s.pollens.bind(_data.from, "Bind");
                      s.pollens.bind(_data.to, "Bind");
                      emit nektarRecorded(_id, msg.sender);
                    } 
                  catch Error(string memory _err) { emit nektarError(string.concat("Error ", _err), msg.sender); } 
                  catch Panic(uint256 _d) { emit nektarError( string.concat("Panic", Strings.toString(_d)), msg.sender );} 
                  catch (bytes memory _b) { emit nektarError( string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))), msg.sender ); }
                  } 
                catch Error(string memory _err) { emit nektarError(string.concat("Error ", _err), msg.sender); } 
                catch Panic(uint256 _d) { emit nektarError( string.concat("Panic", Strings.toString(_d)), msg.sender ); } 
                catch (bytes memory _b) { emit nektarError( string( abi.encodePacked(bytes.concat(bytes("Revert"), _b)) ), msg.sender ); }
              } 
            catch Error(string memory _err) { emit nektarError(string.concat("Error ", _err), msg.sender); } 
            catch Panic(uint256 _d) { emit nektarError( string.concat("Panic", Strings.toString(_d)), msg.sender ); } 
            catch (bytes memory _b) { emit nektarError( string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))), msg.sender ); }
          } 
        else emit nektarError( string.concat( "Permission Denied: ", Strings.toString(uint256(grant)) ), msg.sender );
    }

  function NKTdump(uint256 _rank) public view returns (string memory _d, uint256 _r, bytes32 _id) {
    Nektar storage nektar = s.nektars.nektar[_rank];
    _d = nektar.card.name.text[nektar.card.name.nb].content;
    _id = nektar.id.identity[nektar.id.nb].id;
    _r = s.nektars.nektarIndex[_id];
    }

  /// @dev fetch the list of registered NEKTAR IDs for a given UNIT
  /// @param _unit @ID of the UNIT owner of the NEKTAR
  /// @param _status status of NEKTAR to get list of (INIT(0) for all status)
  /// @return _nektars Array of NEKTAR ID
  /// @return _valid Status of result "OK" if succeeded or error code otherwise
  function NKTreadFromUnit(bytes32 _unit, NektarStatus _status) public view returns (bytes32[] memory _nektars, string memory _valid) {
    GrantStatus grant = s.users.accessGranted( msg.sender, _unit, GRANTED_NEKTAR, (msg.sender == s.owner) );
    if (grant == GrantStatus.GRANTED) {
      try s.nektars.getNektars(_unit, _status) returns (bytes32[] memory _p) { 
        _nektars = _p;
        _valid = "OK";
        } 
      catch Error(string memory _err) { _valid = string.concat("Error ", _err); } 
      catch Panic(uint _d) { _valid = string.concat("Panic", Strings.toString(_d)); } 
      catch (bytes memory _b) { _valid = string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))); }       
      }
    else _valid = string.concat("Permission Denied :", Strings.toString(uint(grant)));
    }

    /// @dev update editable fields of an existing NEKTAR which has DRAFT Status (description, logo image, document path; tco)
    /// @param _nektar @ID of the NEKTAR to update
    /// @param _detail new description (or leave empty if no change)
    /// @param _logo new logo path (or leave empty if no change)
    /// @param _source new source (or leave empty if no change)
    /// @param _tag label for tagging the change operation
    function NKTUpdate( bytes32 _nektar, string memory _detail, string memory _logo, GainSource _source, string memory _tag ) public {
        GrantStatus grant = s.accessNektarGranted( msg.sender, _nektar, GRANTED_NEKTAR, (msg.sender == s.owner) );
        if (grant == GrantStatus.GRANTED) {
            if (!_detail.toSlice().empty()) {
                try s.nektars.changeDescription(_nektar, _detail, _tag) { emit nektarUpdated(_nektar, "Description", msg.sender); } 
                catch Error(string memory _err) { emit nektarError(string.concat("Error ", _err), msg.sender); } 
                catch Panic(uint256 _d) { emit nektarError( string.concat("Panic", Strings.toString(_d)), msg.sender ); } 
                catch (bytes memory _b) { emit nektarError( string( abi.encodePacked(bytes.concat(bytes("Revert"), _b)) ), msg.sender ); }
                }
            if (_source != GainSource.NONE) {
                try s.nektars.changeSource(_nektar, _source, _tag) { emit nektarUpdated(_nektar, "Source", msg.sender); } 
                catch Error(string memory _err) { emit nektarError(string.concat("Error ", _err), msg.sender); } 
                catch Panic(uint256 _d) { emit nektarError( string.concat("Panic", Strings.toString(_d)), msg.sender ); } 
                catch (bytes memory _b) { emit nektarError( string( abi.encodePacked(bytes.concat(bytes("Revert"), _b)) ), msg.sender );}
                }
            if (!_logo.toSlice().empty()) {
                try s.nektars.changeLogo(_nektar, _logo, _tag) { emit nektarUpdated(_nektar, "Logo", msg.sender); } 
                catch Error(string memory _err) { emit nektarError(string.concat("Error ", _err), msg.sender); } 
                catch Panic(uint256 _d) { emit nektarError( string.concat("Panic", Strings.toString(_d)), msg.sender ); } 
                catch (bytes memory _b) { emit nektarError( string( abi.encodePacked(bytes.concat(bytes("Revert"), _b)) ), msg.sender );}
            }
        } else emit nektarError("Permission Denied", msg.sender);
    }

    /// @dev get details of a given NEKTAR
    /// @param _nektar @ID of the  seeked NEKTAR
    /// @return _data struct NektarData with returned values
    /// @return _status struct NektarData with returned values
    /// @return _valid Status of result "OK" if succeeded or error code otherwise
    function NKTread(bytes32 _nektar)
        public
        view
        returns (
            NektarData memory _data,
            NektarStatus _status,
            string memory _valid
        )
    {
        GrantStatus grant = s.accessNektarGranted(
            msg.sender,
            _nektar,
            GRANTED_NEKTAR,
            (msg.sender == s.owner)
        );
        if (grant == GrantStatus.GRANTED) {
            try s.nektars.getNektar(_nektar) returns (
                NektarData memory _d,
                NektarStatus _s
            ) {
                return (_d, _s, "OK");
            } catch Error(string memory _err) {
                _valid = string.concat("Error ", _err);
            } catch Panic(uint256 _d) {
                _valid = string.concat("Panic", Strings.toString(_d));
            } catch (bytes memory _b) {
                _valid = string(
                    abi.encodePacked(bytes.concat(bytes("Revert"), _b))
                );
            }
        } else _valid = "Permission Denied";
    }

    /// @dev Set the status of a given NEKTAR to CERTIFIED
    /// @param _nektar @ID of the NEKTAR to change status to
    /// @param _tag tag for the change
    function NKTCertify(bytes32 _nektar, string calldata _tag) public {
        GrantStatus grant = s.accessNektarGranted( msg.sender, _nektar, GRANTED_NEKTAR, (msg.sender == s.owner) );
        if (grant == GrantStatus.GRANTED) {
            try s.nektars.certify(_nektar, _tag) { emit nektarUpdated(_nektar, "cerfified", msg.sender); } 
            catch Error(string memory _err) { emit nektarError(string.concat("Error ", _err), msg.sender); } 
            catch Panic(uint256 _d) { emit nektarError( string.concat("Panic", Strings.toString(_d)), msg.sender ); } 
            catch (bytes memory _b) { emit nektarError( string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))), msg.sender ); }
            }
        else emit nektarError("Permission Denied", msg.sender);
        }

    /// @dev Set the status of a given NEKTAR to CANCELED. Unibind also the related POLLEN
    /// @param _nektar @ID of the NEKTAR to change status to
    /// @param _tag tag for the change
    function NKTCancel(bytes32 _nektar, string calldata _tag) public {
        GrantStatus grant = s.accessNektarGranted( msg.sender, _nektar, GRANTED_NEKTAR, (msg.sender == s.owner) );
        if (grant == GrantStatus.GRANTED) {
            try s.nektars.cancel(_nektar, _tag) {
                (NektarData memory nektar, ) = s.nektars.getNektar(_nektar);
                s.pollens.certify(nektar.from, _tag);
                s.pollens.certify(nektar.to, _tag);
                emit nektarUpdated(_nektar, "canceled", msg.sender); } 
            catch Error(string memory _err) { emit nektarError(string.concat("Error ", _err), msg.sender); } 
            catch Panic(uint256 _d) { emit nektarError( string.concat("Panic", Strings.toString(_d)), msg.sender ); } 
            catch (bytes memory _b) { emit nektarError( string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))), msg.sender ); }
            } 
        else emit nektarError("Permission Denied", msg.sender);
    }
}
