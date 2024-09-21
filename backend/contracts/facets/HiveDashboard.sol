// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

import "./HiveBase.sol";
import "../libraries/AppStorage.sol";
import "../libraries/nektar/LibNektarBal.sol";
import "../libraries/pollen/LibPollenBal.sol";
import "../libraries/pollen/LibPollenData.sol";
import "../libraries/LibRights.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title HiveDashboard
 * @dev Contract that implement dashboard / KPI view of POLLEN / NEKTAR stocks within the Hive
 */

contract HiveDashboard is HiveBase {
  using LibNektarBal for NektarStorage;
  using LibPollenBal for PollenStorage;
  using LibPollenData for PollenStorage;
  using LibRights for UserStorage;

  uint16 constant GRANTED_DASHBOARD_POL = ROLE_ADMIN | ROLE_BUSINESS | ROLE_CERTIFIER | ROLE_DELEGATE | ROLE_DECISION;
  uint16 constant GRANTED_DASHBOARD_NKT = ROLE_ADMIN | ROLE_FINANCE | ROLE_CERTIFIER | ROLE_DELEGATE | ROLE_DECISION | ROLE_PROMOTE;

  constructor()  {}

  /// @dev Beacon function that checks whether or not contract instance is deployed and accessible in the block chein
  /// @return if contract alive then "<ContractName> alive!" is returned
  function beacon_HiveDashboard() public pure returns (string memory) { return "HiveDashboard::1.0.0"; }

  /// @dev Get the total number of POLLEN in the Hive
  /// @return Total number of POLLEN regardless status or ownership
  function POLCounts() public view returns (uint256) { return (s.pollens.counts()); }

  /// @dev Get de GHG emissions per scope for a given UNIT
  /// @param _unit @ID of the UNIT to scan
  /// @param _status Status of POLLEN to check (INIT = All status)
  /// @return _scope Array of values for each of the scopes
  /// @return _pollens Number of POLLENS for GHG value for the UNIT
  /// @return _total Total GHG value for the UNIT
  /// @return _valid Status of result "OK" if succeeded or error code otherwise
  function POLStockFromUnit( bytes32 _unit, PollenStatus _status ) 
  public view returns (uint256[] memory _scope, uint256 _pollens, uint256 _total, string memory _valid) {
    GrantStatus grant = s.users.accessGranted( msg.sender, _unit, GRANTED_DASHBOARD_POL, (msg.sender == s.owner) );
    if (grant == GrantStatus.GRANTED) {   
      try s.pollens.balances( _unit, _status ) returns (uint256[] memory _s, uint256 _p, uint256 _t) { return (_s, _p, _t, "OK"); } 
      catch Error(string memory _err) { _valid = string.concat("Error ", _err); } 
      catch Panic(uint _d) { _valid = string.concat("Panic", Strings.toString(_d)); } 
      catch (bytes memory _b) { _valid = string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))); }       
      }
    }

  /// @dev Get de TCO value for a given UNIT
  /// @param _unit @ID of the UNIT to scan
  /// @param _status status of POLLEN to check (INIT = All status)
  /// @return _tco Total TCO value for the UNIT per Currency (Array[Currency])
  /// @return _pollens Number of POLLENS for GHG value for the UNIT
  /// @return _valid status of result "OK" if succeeded or error code otherwise
  function POLTcoFromUnit( bytes32 _unit, PollenStatus _status ) 
  public view returns (uint256[] memory _tco, uint256 _pollens, string memory _valid) {
    GrantStatus grant = s.users.accessGranted( msg.sender, _unit, GRANTED_DASHBOARD_POL, (msg.sender == s.owner) );
    if (grant == GrantStatus.GRANTED) {   
      try s.pollens.readTco( _unit, _status ) returns (uint256[] memory _t, uint256 _p) { return (_t, _p, "OK"); } 
      catch Error(string memory _err) { _valid = string.concat("Error ", _err); } 
      catch Panic(uint _d) { _valid = string.concat("Panic", Strings.toString(_d)); } 
      catch (bytes memory _b) { _valid = string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))); }       
      }
    }

  /// @dev Get the GHG emissions per scope and TCO overall
  /// @return _scope Array of values for each of the scopes
  /// @return _total Total GHG value for the UNIT
  /// @return _tco Total TCO value for the UNIT
  /// @return _pollens Number of POLLENS for GHG value for the UNIT
  /// @return _valid status of result "OK" if succeeded or error code otherwise
  function POLOverallStock() 
  public view returns (uint256[] memory _scope, uint256 _total, uint256[] memory _tco, uint256 _pollens, string memory _valid) {
      try s.pollens.balances() returns (uint256[] memory _s, uint256 _t, uint256[] memory _tc, uint256 _p) { return (_s, _t, _tc, _p, "OK"); } 
      catch Error(string memory _err) { _valid = string.concat("Error ", _err); } 
      catch Panic(uint _d) {  _valid = string.concat("Panic", Strings.toString(_d)); } 
      catch (bytes memory _b) {  _valid = string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))); }       
    }

  /// @dev Get NEKTAR KPI / GHG emissions for a given UNIT
  /// @param _unit @ID of the UNIT to scan
  /// @param _status status of NEKTAR to check (INIT = All status)
  /// @return _count Number of NEKTAR counted
  /// @return _tco TCO value for all of the NEKTAR
  /// @return _total Total GHG value all of the NEKTAR
  /// @return _valid status of result "OK" if succeeded or error code otherwise
  function NKTStockFromUnit( bytes32 _unit, NektarStatus _status ) 
  public view returns (uint256 _count, uint256 _tco, uint256 _total, string memory _valid) {
    GrantStatus grant = s.users.accessGranted( msg.sender, _unit, GRANTED_DASHBOARD_NKT, (msg.sender == s.owner) );
    if (grant == GrantStatus.GRANTED) {   
      try s.nektars.balances( _unit, _status ) returns (uint256 _c, uint256 _tc, uint256 _t) { return (_c, _tc, _t, "OK"); } 
      catch Error(string memory _err) { _valid = string.concat("Error ", _err); } 
      catch Panic(uint _d) { _valid = string.concat("Panic", Strings.toString(_d)); } 
      catch (bytes memory _b) { _valid = string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))); }       
      }
    }

  /// @dev Get the KPI for NEKTARS / GHG emissions and TCO overall
  /// @return _nb Number of NEKTAR counted
  /// @return _total Total GHG value all of the NEKTAR
  /// @return _tco TCO value for all of the NEKTAR
  /// @return _valid status of result "OK" if succeeded or error code otherwise
  function NKTOverallStock() public view returns (uint256 _nb, uint256 _total, uint256 _tco, string memory _valid) {
    try s.nektars.balances() returns (uint256 _n, uint256 _t, uint256 _tc) { return (_n, _t, _tc, "OK"); } 
    catch Error(string memory _err) { _valid = string.concat("Error ", _err); } 
    catch Panic(uint _d) {  _valid = string.concat("Panic", Strings.toString(_d)); } 
    catch (bytes memory _b) {  _valid = string(abi.encodePacked(bytes.concat(bytes("Revert"), _b))); }       
    }
}
