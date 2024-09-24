// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

// Librairie implémentant un journal de traçabilité des enregistrements

import "./LibPollenData.sol";
import "./LibPollenSts.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

struct PollenData {
  string name;
  string detail;
  string logo;
  string document; // IPFS Name & Path of the related "Bilan Carbone"
  uint16 period;
  uint16 start;   // Starting year of the period
  uint16 index;   // current pollen index within the period
  PollenStatus status;
  Currency currency;
  UnitScale scale;
  }

/**
 * @title LibPollenSet
 * @dev Contract that implement functions to manage accounts POLLEN Token Hive.
 */

library LibPollenSet {

  using LibObjCard for ObjCard;
  using LibAddress for AddressLog;
  using LibTexts for TextLog;
  using LibStatus for StatusLog;
  using LibCurrency for CurrencyLog;
  using LibValue for ValueLog;
  using LibScale for ScaleLog;
  using LibErrors for *;
  using StringUtilsLib for *;
  using LibIdentifier for IdLog;
  using LibPollenData for PollenStorage;
  using LibPollenSts for PollenStorage;
  using LinkedListLib for LinkedListLib.LinkedList;

  //error idValue(bytes32);

  // Version 1.0.1 : extended getParent with doc feature
  // Version 1.0.2 : extended changeTCO with catch error management
  function beacon_LibPollenSet() public pure returns (string memory) { return "LibPollenSet::1.0.2"; }

  /// @dev Create & initialize a new POLLEN token with preliminary data. Inital Tag is "Root"
  /// @param _self stored PollenStorage structure that contains POLLEN list
  /// @param _unit Identifier of the parent unit to relate to
  /// @param _data data of the POLLEN Token
  /// @return _pollen @ID of the new POLLEN created = f( start date, period, index )
  function initPollen(PollenStorage storage _self, bytes32 _unit, PollenData memory _data ) external returns (bytes32 _pollen) {
      _data.name.notNull( "initPollen::Name");
      _unit.notNull( "initPollen::Unit");
      _data.period.notNone( "initPollen::Period");
      _data.start.notNone( "initPollen::Period");
      if ((_data.start < 2000) || (_data.start > 2050)) revert("Incompatible start year");
      if (_data.index > _data.period) revert("Incompatible index");

      string memory id = string.concat(Strings.toString(_data.start), Strings.toString(_data.period),Strings.toString(_data.index));
      
      if (_self.isNotValid( LibIdentifier.test(Identity.POLLEN, string.concat("Root", string(abi.encodePacked(_unit)), id)) )) {
        Pollen storage pollen = _self.pollen[++_self.nbPollens];

        _pollen = pollen.id.create( Identity.POLLEN, string.concat("Root", string(abi.encodePacked(_unit)), id) );
        _self.pollenIndex[_pollen] = _self.nbPollens;

        pollen.card.create( _data.name, _unit );
        pollen.status.changePollen( PollenStatus.DRAFT, "Root" );  
        _self.pollen[_self.nbPollens].currency.change( _data.currency, "Root" );
        _self.pollen[_self.nbPollens].unit.change( _data.scale, "Root" );
        _self.pollen[_self.nbPollens].period = _data.period;
        _self.pollen[_self.nbPollens].start = _data.start;
        _self.pollen[_self.nbPollens].index = _data.index;
        _self.pollenFromUnit[_unit].push( _self.nbPollens, true);

        if (_data.detail.toSlice().empty()) _self.pollen[_self.nbPollens].card.Description( _data.detail, "Root" );
        if (_data.document.toSlice().empty()) _self.pollen[_self.nbPollens].document.change( TextType.FILE, _data.document, "Root", block.timestamp);
        if (_data.logo.toSlice().empty()) _self.pollen[_self.nbPollens].card.Logo( _data.logo, "Root" );
        }
      }


  /// @dev check that two specific POLLEN are compliants for creating a new NEKTAR
  /// @param _self stored PollenStorage structure that contains user objects
  /// @param _from @ID of the first POLLEN to check
  /// @param _to @ID of the second POLLEN to check
  /// @return _period value if OK
  /// @return _start value if OK
  function isEligibleForNektar( PollenStorage storage _self, bytes32 _from, bytes32 _to ) external view returns ( uint16 _period, uint16 _start ) {
    Pollen storage base = _self.isCertified(_from); 
    Pollen storage to = _self.isCertified(_to);
    if (base.start != to.start) revert("Incompatible start POLLEN");
    if (base.period != to.period) revert("Incompatible period POLLEN");
    if (base.index >= to.index) revert("Incompatible index POLLEN");
    return ( base.period, base.start );
    }

  /// @dev check that two specific POLLEN are compliants for creating a new NEKTAR
  /// @param _self stored PollenStorage structure that contains from objects
  /// @param _from @ID of the first POLLEN to check
  /// @param _to @ID of the second POLLEN to check
  /// @return _tco the total tco related to the POLLENS
  /// @return _total GHG emissions delta related to the POLLENS
  /// @return _scale GHG emissions delta related to the POLLENS
  /// @return _currency GHG emissions delta related to the POLLENS
  function getDelta( PollenStorage storage _self, bytes32 _from, bytes32 _to ) external view returns ( uint256 _tco, uint256 _total, UnitScale _scale, Currency _currency ) {
    Pollen storage from = _self.isCertified(_from);
    Pollen storage to = _self.isCertified(_to);

    (uint256 totalfrom, , ) = from.quantity.current();
    uint256 fromTotal = from.unit.convert2Unit(totalfrom);
    (uint256 totalto, , ) = to.quantity.current();
    uint256 toTotal = to.unit.convert2Unit(totalto);
    if (fromTotal <= toTotal) revert(string.concat("No GHG reduction from ", Strings.toString(totalfrom), " to ", Strings.toString(totalto)));
    _total = toTotal - fromTotal;
    _scale = UnitScale.unit;
    (uint256 tcofrom, , ) = from.tco.current();
    uint256 fromTCO = from.currency.convert2euros(tcofrom);
    (uint256 tcoto, , ) = to.tco.current();
    uint256 toTCO = to.currency.convert2euros(tcoto);
    _tco = fromTCO + toTCO;
    _scale = UnitScale.unit;
    _currency = Currency.EURO;
    }


  /// @dev Set specfic description to a POLLEN which is DRAFT
  /// @param _self stored PollenStorage structure that contains POLLEN objects
  /// @param _id bytes32 of the POLLEN to get identity features
  /// @param _detail description to set for the POLLEN
  /// @param _tag Label to mark flag/identify the change
  function changeDescription(PollenStorage storage _self, bytes32 _id, string memory _detail, string memory _tag) external {
    _detail.notNull( "Description");
    _tag.notNull( "Tag");
    _self.isDraft(_id).card.Description( _detail, _tag );
    }

  /// @dev Set specfic document reference (Bilan Carbone or alike) to a POLLEN which is DRAFT
  /// @param _self stored PollenStorage structure that contains POLLEN objects
  /// @param _id bytes32 of the POLLEN to get identity features
  /// @param _document document IPFS path to relate to the POLLEN
  /// @param _tag Label to mark flag/identify the change
  function changeDocument(PollenStorage storage _self, bytes32 _id, string memory _document, string memory _tag) external {
    _document.notNull( "Document");
    _tag.notNull( "Tag");
    _self.isDraft(_id).document.change( TextType.FILE, _document, _tag, block.timestamp);
    }

  /// @dev Set specfic TCO to a POLLEN which is DRAFT
  /// @param _self stored PollenStorage structure that contains POLLEN objects
  /// @param _id bytes32 of the POLLEN to get identity features
  /// @param _tco TCO to set for the POLLEN
  function changeTCO(PollenStorage storage _self, bytes32 _id, uint256 _tco, string memory _tag) external {
    try _self.isDraft(_id).tco.change (_tco.notNone( "TCO"), _tag.notNull( "Tag")) {} 
    catch Error(string memory _err) { revert(_err); } 
    //_self.isDraft(_id).tco.change (_tco.notNone( "TCO"), _tag.notNull( "Tag"));
    }

  /// @dev Set specfic logo path to a POLLEN which is DRAFT
  /// @param _self stored PollenStorage structure that contains POLLEN objects
  /// @param _id bytes32 of the POLLEN to get identity features
  /// @param _path for the logo to set for the POLLEN
  /// @param _tag Label to mark flag/identify the change
  function changeLogo(PollenStorage storage _self, bytes32 _id, string memory _path, string memory _tag) external {
    _path.notNull( "Logo");
    _tag.notNull( "Tag");
    _self.isDraft(_id).card.Logo( _path, _tag );
    }

  /// @dev returns the details related to the entity
  /// @param _self stored PollenStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @return _name for the given entity
  /// @return _detail for the given entity
  /// @return _doc for the given entity
  /// @return _status for the given entity
  /// @return _logo for the given entity
  /// @return _period for the given entity
  /// @return _start for the given entity
  /// @return _index for the given entity
  function getPollen(PollenStorage storage _self, bytes32 _id) external view returns (string memory _name, string memory _detail, string memory _doc, PollenStatus _status, string memory _logo, uint16 _period, uint16 _start, uint16 _index ) {
    Pollen storage pollen = _self.isPollen(_id);
    (_name, _detail, _logo, , ) = pollen.card.current();
    (_status,  ,  ) = pollen.status.currentPollen();
    ( , _doc,  ,  ) = pollen.document.current();
    _period = pollen.period;
    _start = pollen.start;
    _index = pollen.index;
    }

}
