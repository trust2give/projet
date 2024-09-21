// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

import "./HiveBase.sol";
import "../libraries/AppStorage.sol";
import "../libraries/LibRights.sol";
import "../libraries/pollen/LibPollenData.sol";
import "../libraries/pollen/LibPollenQty.sol";
import "../libraries/pollen/LibPollenSet.sol";
import "../libraries/pollen/LibPollenSts.sol";

/**
 * @title HivePollen
 * @dev Contract that implement functions to manage accounts POLLEN Token Hive.
 * @dev POLLEN Token represent and qualify effective GHG Reports (1 POLLEN per GHG Report)
 */

contract HivePollen is HiveBase {

  using LibPollenData for PollenStorage;
  using LibPollenQty for PollenStorage;
  using LibPollenSts for PollenStorage;
  using LibPollenSet for PollenStorage;
  using StringUtilsLib for *;
  using LibRights for AppStorage;
  using LibRights for UserStorage;

  uint16 constant GRANTED_POLLEN = ROLE_ADMIN | ROLE_BUSINESS | ROLE_DELEGATE;

  constructor()  {}

  event pollenRecorded(bytes32 _id, address _user);
  event pollenUpdated(bytes32 _id, string _label, address _user );
  event pollenError(string _error, address _user);

  // Version 1.0.1 : extend POLread function
  // Version 1.0.2 : extend POLread function with document feature
  function beacon_HivePollen() public pure returns (string memory) { return "HivePollen::1.0.2"; }

  /// @dev create a new POLLEN with mandatory data
  /// @param _unit @ID of the UNIT owner of the POLLEN
  /// @param _data struct PollenData with init values
  function POLNew(bytes32 _unit, PollenData memory _data ) public {  
    GrantStatus grant = s.users.accessGranted( msg.sender, _unit, GRANTED_POLLEN, (msg.sender == s.owner) );
    if (grant == GrantStatus.GRANTED) {
      try s.pollens.initPollen( _unit, _data ) returns (bytes32 _id) { emit pollenRecorded(_id, msg.sender); } 
      catch Error(string memory _err) { emit pollenError(string.concat("Error ", _err), msg.sender); } 
      catch Panic(uint _d) { emit pollenError(string.concat("Panic", Strings.toString(_d)), msg.sender); } 
      catch (bytes memory _b) { emit pollenError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))), msg.sender); }            
      }
    else emit pollenError(string.concat( "Permission Denied: ", Strings.toString(uint(grant))), msg.sender);
    }

  /// @dev update editable fields of an existing POLLEN which has DRAFT Status (description, logo image, document path; tco)
  /// @param _pollen @ID of the POLLEN to update
  /// @param _detail new description (or leave empty if no change)
  /// @param _logo new logo path (or leave empty if no change)
  /// @param _doc new document path (or leave empty if no change)
  /// @param _tco new tco value (or 0 if no change)
  /// @param _tag label for tagging the change operation
  function POLUpdate(bytes32 _pollen, string memory _detail, string memory _logo, string memory _doc, uint256 _tco, string memory _tag ) public {  
    GrantStatus grant = s.accessPollenGranted( msg.sender, _pollen, GRANTED_POLLEN, (msg.sender == s.owner) );
    if (grant == GrantStatus.GRANTED) {
      if (!_detail.toSlice().empty()) {
        try s.pollens.changeDescription( _pollen, _detail, _tag) { emit pollenUpdated( _pollen, "Description", msg.sender); } 
        catch Error(string memory _err) { emit pollenError(string.concat("Error ", _err), msg.sender); } 
        catch Panic(uint _d) { emit pollenError(string.concat("Panic", Strings.toString(_d)), msg.sender); } 
        catch (bytes memory _b) {  emit pollenError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))), msg.sender); }
        }
      if (!_doc.toSlice().empty()) {
        try s.pollens.changeDocument( _pollen, _doc, _tag) { emit pollenUpdated( _pollen, "Document", msg.sender); } 
        catch Error(string memory _err) { emit pollenError(string.concat("Error ", _err), msg.sender); } 
        catch Panic(uint _d) { emit pollenError(string.concat("Panic", Strings.toString(_d)), msg.sender); } 
        catch (bytes memory _b) {  emit pollenError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))), msg.sender); }
        }
      if (!_logo.toSlice().empty()) {
        try s.pollens.changeLogo( _pollen, _logo, _tag) { emit pollenUpdated( _pollen, "Logo", msg.sender); } 
        catch Error(string memory _err) { emit pollenError(string.concat("Error ", _err), msg.sender); } 
        catch Panic(uint _d) { emit pollenError(string.concat("Panic", Strings.toString(_d)), msg.sender); } 
        catch (bytes memory _b) {  emit pollenError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))), msg.sender); }
        }
      if (_tco > 0) {
        try s.pollens.changeTCO( _pollen, _tco, _tag) { emit pollenUpdated( _pollen, "Logo", msg.sender); } 
        catch Error(string memory _err) { emit pollenError(string.concat("Error ", _err), msg.sender); } 
        catch Panic(uint _d) { emit pollenError(string.concat("Panic", Strings.toString(_d)), msg.sender); } 
        catch (bytes memory _b) {  emit pollenError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))), msg.sender); }
        }
      }
    else emit pollenError("Permission Denied", msg.sender);
    }

  function POLdump(uint256 _rank) public view returns (string memory _d, uint256 _r, bytes32 _id) {
    Pollen storage pollen = s.pollens.pollen[_rank];
    _d = pollen.card.name.text[pollen.card.name.nb].content;
    _id = pollen.id.identity[pollen.id.nb].id;
    _r = s.pollens.pollenIndex[_id];
    }

  /// @dev get details of a given POLLEN
  /// @param _pollen @ID of the  seeked POLLEN
  /// @return _data struct PollenData with returned values
  function POLread(bytes32 _pollen) public view returns (PollenData memory _data, string memory _valid) {
    GrantStatus grant = s.accessPollenGranted( msg.sender, _pollen, GRANTED_POLLEN, (msg.sender == s.owner) );
    if (grant == GrantStatus.GRANTED) {
      try s.pollens.getPollen( _pollen ) returns (string memory _n, string memory _d, string memory _f, PollenStatus _s, string memory _l, uint16 _p, uint16 _st, uint16 _i ) { 
         _data.name = _n; 
         _data.detail = _d; 
         _data.status = _s; 
         _data.logo = _l; 
         _data.document = _f; 
         _data.period = _p; 
         _data.start = _st; 
         _data.index = _i;
        _valid = "OK";
        } 
      catch Error(string memory _err) { _valid = string.concat("Error ", _err); } 
      catch Panic(uint _d) { _valid = string.concat("Panic", Strings.toString(_d)); } 
      catch (bytes memory _b) { _valid = string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))); }       
      }
    else _valid = string.concat("Permission Denied :", Strings.toString(uint(grant)));
    }

  /// @dev fetch the list of registered POLLEN IDs for a given UNIT
  /// @param _unit @ID of the UNIT owner of the POLLEN
  /// @param _status status of POLLEN to get list of (INIT(0) for all status)
  /// @return _pollens Array of POLLEN ID
  /// @return _valid Status of result "OK" if succeeded or error code otherwise
  function POLreadFromUnit(bytes32 _unit, PollenStatus _status) public view returns (bytes32[] memory _pollens, string memory _valid) {
    GrantStatus grant = s.users.accessGranted( msg.sender, _unit, GRANTED_POLLEN, (msg.sender == s.owner) );
    if (grant == GrantStatus.GRANTED) {
      try s.pollens.getPollens(_unit, _status) returns (bytes32[] memory _p) { 
        _pollens = _p;
        _valid = "OK";
        } 
      catch Error(string memory _err) { _valid = string.concat("Error ", _err); } 
      catch Panic(uint _d) { _valid = string.concat("Panic", Strings.toString(_d)); } 
      catch (bytes memory _b) { _valid = string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))); }       
      }
    else _valid = string.concat("Permission Denied :", Strings.toString(uint(grant)));
    }

  /// @dev updates de GHG emissions per scope for a given POLLEN
  /// @param _pollen @ID of the POLLEN to update
  /// @param _scope Array of values for each of the scopes
  /// @param _scale scale unit for values
  /// @param _tag tag for the change
  function POLUpdateScopes( bytes32 _pollen, uint256[] memory _scope, UnitScale _scale, string memory _tag) public {
    GrantStatus grant = s.accessPollenGranted( msg.sender, _pollen, GRANTED_POLLEN, (msg.sender == s.owner) );
    if (grant == GrantStatus.GRANTED) {
      try s.pollens.updateScopes( _pollen, _scope, _scale, _tag ) returns (bytes32 _p) { emit pollenUpdated(_p, "scope", msg.sender); } 
      catch Error(string memory _err) { emit pollenError(string.concat("Error ", _err), msg.sender); } 
      catch Panic(uint _d) { emit pollenError(string.concat("Panic", Strings.toString(_d)), msg.sender); } 
      catch (bytes memory _b) { emit pollenError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))), msg.sender); }            
      }
    else emit pollenError("Permission Denied", msg.sender);
    }

  /// @dev Get de GHG emissions per scope for a given POLLEN
  /// @param _pollen @ID of the POLLEN to update
  /// @return _scope Array of values for each of the scopes
  /// @return _total Total GHG value for the POLLEN
  /// @return _tco tco value for the POLLEN
  /// @return _scale scale unit for GHG values
  /// @return _currency currency unit for the tco value
  /// @return _valid Status of result "OK" if succeeded or error code otherwise
  function POLreadScopes( bytes32 _pollen ) 
  public view returns (uint256[] memory _scope, uint256 _total, uint256 _tco, UnitScale _scale, Currency _currency, string memory _valid) {
    GrantStatus grant = s.accessPollenGranted( msg.sender, _pollen, GRANTED_POLLEN, (msg.sender == s.owner) );
    if (grant == GrantStatus.GRANTED) {
      try s.pollens.getScopes(_pollen) returns (uint256[] memory _s, uint256 _t, uint256 _tc, UnitScale _sc, Currency _c) { 
        _scope = _s;
        _total = _t;
        _tco = _tc;
        _scale = _sc;
        _currency = _c;
        _valid = "OK";
        } 
      catch Error(string memory _err) { _valid = string.concat("Error ", _err); } 
      catch Panic(uint _d) { _valid = string.concat("Panic", Strings.toString(_d)); } 
      catch (bytes memory _b) { _valid = string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))); }       
      }
    else _valid = "Permission Denied";
    }

  /// @dev Set the status of a given POLLEN to CERTIFIED
  /// @param _pollen @ID of the POLLEN to change status to
  /// @param _tag tag for the change
  function POLCertify( bytes32 _pollen, string calldata _tag) public {
    GrantStatus grant = s.accessPollenGranted( msg.sender, _pollen, GRANTED_POLLEN, (msg.sender == s.owner) );
    if (grant == GrantStatus.GRANTED) {
      try s.pollens.certify( _pollen, _tag) { emit pollenUpdated(_pollen, "cerfified", msg.sender); } 
      catch Error(string memory _err) { emit pollenError(string.concat("Error ", _err), msg.sender); } 
      catch Panic(uint _d) { emit pollenError(string.concat("Panic", Strings.toString(_d)), msg.sender); } 
      catch (bytes memory _b) { emit pollenError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))), msg.sender); }            
      }
    else emit pollenError("Permission Denied", msg.sender);
    }

  /// @dev Set the status of a given POLLEN to CANCELED
  /// @param _pollen @ID of the POLLEN to change status to
  /// @param _tag tag for the change
  function POLCancel( bytes32 _pollen, string calldata _tag) public {
    GrantStatus grant = s.accessPollenGranted( msg.sender, _pollen, GRANTED_POLLEN, (msg.sender == s.owner) );
    if (grant == GrantStatus.GRANTED) {
      try s.pollens.cancel( _pollen, _tag) { emit pollenUpdated(_pollen, "canceled", msg.sender ); } 
      catch Error(string memory _err) { emit pollenError(string.concat("Error ", _err), msg.sender); } 
      catch Panic(uint _d) { emit pollenError(string.concat("Panic", Strings.toString(_d)), msg.sender); } 
      catch (bytes memory _b) { emit pollenError(string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))), msg.sender); }            
      }
    else emit pollenError("Permission Denied", msg.sender);
    }

}
