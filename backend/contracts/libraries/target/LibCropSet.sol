// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

// Librairie implémentant un journal de traçabilité des enregistrements

import "./LibCropData.sol";
import "./LibCropSts.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

struct CropData {
  string name;
  string detail;
  string logo;
  uint16 start;   // Starting year of the period
  uint8 periods; // Valeur qui indique le nombre de périodes dans l'élongation calendaire de la trajectoire
  PeriodType unit;  
  uint256 quota; // Valeur indiquant le quota total maximum d'émission de GES cible pour l'entité
  uint256 gain; // Valeur indiquant le gain total maximum d'émission de GES par rapport à la trajectoire As-Usual
  uint256[] period;
  UnitScale scale;
  }

/**
 * @title LibCropSet
 * @dev Contract that implement functions to manage accounts CROP Token Hive.
 */

library LibCropSet {

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
  using LibCropData for CropStorage;
  using LibCropSts for CropStorage;
  using LinkedListLib for LinkedListLib.LinkedList;

  //error idValue(bytes32);

  // Version 1.0.1 : lib creation
  function beacon_LibCropSet() public pure returns (string memory) { return "LibCropSet::1.0.1"; }

  /// @dev Create & initialize a new CROP token with preliminary data. Inital Tag is "Root"
  /// @param _self stored CropStorage structure that contains CROP list
  /// @param _unit Identifier of the parent unit to relate to
  /// @param _data data of the CROP Token
  /// @return _crop @ID of the new CROP created = f( start date, period, index )
  function initCrop(CropStorage storage _self, bytes32 _unit, CropData memory _data ) external returns (bytes32 _crop) {
      _unit.notNull( "initCrop::Parent Unit");
      _data.name.notNull( "initCrop::Name");
      _data.periods.notNone( "initCrop::Periods");
      _data.start.inRange16( 2000, 2050, "initCrop::Start year");
       require(_data.unit != PeriodType.NONE, "initCrop::Unit is NONE");

      string memory id = string.concat( _data.name, Strings.toString(_data.start), Strings.toString(_data.periods));
      
      if (_self.isNotValid( LibIdentifier.test(Identity.CROP, string.concat("Root", string(abi.encodePacked(_unit)), id)) )) {
        Crop storage crop = _self.crop[++_self.nbCrops];

        _crop = crop.id.create( Identity.CROP, string.concat("Root", string(abi.encodePacked(_unit)), id) );
        _self.cropIndex[_crop] = _self.nbCrops;

        crop.card.create( _data.name, _unit );
        crop.status.change( Status.DRAFT, "Root" );  

        _self.crop[_self.nbCrops].start = _data.start;
        _self.crop[_self.nbCrops].periods = _data.periods;
        _self.crop[_self.nbCrops].unit = _data.unit;
        if (_data.quota > 0) _self.crop[_self.nbCrops].quota = _data.quota;
        if (_data.gain > 0) _self.crop[_self.nbCrops].gain = _data.gain;
        _self.crop[_self.nbCrops].scale.change( _data.scale, "Root" );

        _self.cropFromUnit[_unit].push( _self.nbCrops, true);

        if (_data.period.length > 0) {

          }

        if (_data.detail.toSlice().empty()) _self.crop[_self.nbCrops].card.Description( _data.detail, "Root" );
        if (_data.logo.toSlice().empty()) _self.crop[_self.nbCrops].card.Logo( _data.logo, "Root" );
        }
      }

  /// @dev Set specfic description to a CROP which is DRAFT
  /// @param _self stored CropStorage structure that contains CROP objects
  /// @param _id bytes32 of the CROP to get identity features
  /// @param _detail description to set for the CROP
  /// @param _tag Label to mark flag/identify the change
  function changeDescription(CropStorage storage _self, bytes32 _id, string memory _detail, string memory _tag) external {
    _detail.notNull( "Description");
    _tag.notNull( "Tag");
    _self.isDraft(_id).card.Description( _detail, _tag );
    }

  /// @dev Set specfic logo path to a CROP which is DRAFT
  /// @param _self stored CropStorage structure that contains CROP objects
  /// @param _id bytes32 of the CROP to get identity features
  /// @param _path for the logo to set for the CROP
  /// @param _tag Label to mark flag/identify the change
  function changeLogo(CropStorage storage _self, bytes32 _id, string memory _path, string memory _tag) external {
    _path.notNull( "Logo");
    _tag.notNull( "Tag");
    _self.isDraft(_id).card.Logo( _path, _tag );
    }

  /// @dev Set specfic quota to a CROP which is DRAFT
  /// @param _self stored CropStorage structure that contains CROP objects
  /// @param _id bytes32 of the CROP to get identity features
  /// @param _path for the logo to set for the CROP
  /// @param _tag Label to mark flag/identify the change
  function changeQuotaAndGain(CropStorage storage _self, bytes32 _id, uint256 _quota, uint256 _gain,string memory _tag) external {
    _path.notNull( "Logo");
    _tag.notNull( "Tag");
    _self.isDraft(_id).card.Logo( _path, _tag );
    }

  /// @dev returns the details related to the entity
  /// @param _self stored CropStorage structure that contains user objects
  /// @param _id @ETH address of the user to get identity features
  /// @return _data for the given CROP
  /// @return _status for the given CROP
  function getCrop(CropStorage storage _self, bytes32 _id) external view returns (CropData memory _data, Status _status ) {
    Crop storage crop = _self.isCrop(_id);
    (_data.name, _data.detail, _data.logo, , ) = crop.card.current();
    (_status,  ,  ) = crop.status.current();
    _data.periods = crop.periods;
    _data.start = crop.start;
    }

}
