// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

// Librairie implémentant un journal de traçabilité des enregistrements

import "./LibNektarData.sol";
import "./LibNektarSts.sol";
import "../general/LibSources.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// Contrat Nektar
// Un Token Nektar

struct NektarData {
  string name;
  string detail;
  string logo;
  bytes32 from;
  bytes32 to;
  uint256 quantity;
  uint256 tco;
  uint16 start;
  uint16 period;
  Currency currency;
  UnitScale scale;
  GainSource source;
  bytes32 parent;
  }

library LibNektarSet {

  using LibObjCard for ObjCard;
  using LibIdentifier for IdLog;
  using LibTexts for TextLog;
  using LibStatus for StatusLog;
  using LibCurrency for CurrencyLog;
  using LibValue for ValueLog;
  using LibScale for ScaleLog;
  using LibSources for SourceLog;
  using LibErrors for *;
  using StringUtilsLib for *;
  using LibIdentifier for IdLog;
  using LibNektarData for NektarStorage;
  using LibNektarSts for NektarStorage;
  using LinkedListLib for LinkedListLib.LinkedList;

  function beacon_LibNektarSet() public pure returns (string memory) { return "LibNektarSet::1.0.0"; }

  /// @dev Create & initialize a new NEKTAR token with preliminary data. Inital Tag is "Root"
  /// @param _self stored NektarStorage structure that contains NEKTAR list
  /// @param _data data of the NEKTAR Token
  /// @return _nektar @ID of the new NEKTAR created
  function initNektar(NektarStorage storage _self, NektarData memory _data ) external returns (bytes32 _nektar) {
      _data.name.notNull( "initNektar::Name");
      _data.parent.notNull( "initNektar::Unit");
      uint8(_data.scale).notNone( "initNektar::Scale");
      uint8(_data.currency).notNone( "initNektar::Currency");
      _data.from.notNull( "initNektar::From");
      _data.to.notNull( "initNektar::To");
      _data.period.notNone( "initNektar::Period");
      _data.start.notNone( "initNektar::start");
      _data.quantity.notNone( "initNektar::quantity");
      _data.tco.notNone( "initNektar::tco");

      string memory id = string(abi.encodePacked(_data.from, _data.to));

      if (_self.isValid( LibIdentifier.test(Identity.NEKTAR, string.concat("Root", string(abi.encodePacked(_data.parent)), id)) )) revert("Nektar already registered");
      Nektar storage nektar = _self.nektar[++_self.nbNektars];

      _nektar = nektar.id.create( Identity.NEKTAR, string.concat("Root", string(abi.encodePacked(_data.parent)), id));
      _self.nektarIndex[_nektar] = _self.nbNektars;

      nektar.card.create( _data.name, _data.parent );

      _self.nektar[_self.nbNektars].pollen[++_self.nektar[_self.nbNektars].pollens] = _data.from;
      _self.nektar[_self.nbNektars].pollen[++_self.nektar[_self.nbNektars].pollens] = _data.to;

      nektar.status.changeNektar( NektarStatus.DRAFT, "Root" ); 

      _self.nektar[_self.nbNektars].currency.change( _data.currency, "Root" );
      _self.nektar[_self.nbNektars].unit.change( _data.scale, "Root" );
      _self.nektarFromUnit[_data.parent].push( _self.nbNektars, true);
      
      _self.nektar[_self.nbNektars].period = _data.period;
      _self.nektar[_self.nbNektars].start = _data.start;
      _self.nektar[_self.nbNektars].quantity.change( _data.quantity, "Root" );
      _self.nektar[_self.nbNektars].tco.change( _data.tco, "Root" );

      if (_data.source != GainSource.NONE) _self.nektar[_self.nbNektars].source.change( _data.source, "Root" );
      if (_data.detail.toSlice().empty()) _self.nektar[_self.nbNektars].card.Description( _data.detail, "Root" );
      if (_data.logo.toSlice().empty()) _self.nektar[_self.nbNektars].card.Logo( _data.logo, "Root" );
      }

  /// @dev Set specfic description to a NEKTAR which is DRAFT
  /// @param _self stored NektarStorage structure that contains NEKTAR objects
  /// @param _id bytes32 of the NEKTAR to get identity features
  /// @param _detail description to set for the NEKTAR
  /// @param _tag Label to mark flag/identify the change
  function changeDescription(NektarStorage storage _self, bytes32 _id, string memory _detail, string memory _tag) external {
    _detail.notNull( "Description");
    _tag.notNull( "Tag");
    _self.isDraft(_id).card.Description( _detail, _tag );
    }

  /// @dev Set specfic logo path to a NEKTAR which is DRAFT
  /// @param _self stored NektarStorage structure that contains NEKTAR objects
  /// @param _id bytes32 of the NEKTAR to get identity features
  /// @param _path for the logo to set for the NEKTAR
  /// @param _tag Label to mark flag/identify the change
  function changeLogo(NektarStorage storage _self, bytes32 _id, string memory _path, string memory _tag) external {
    _path.notNull( "Logo");
    _tag.notNull( "Tag");
    _self.isDraft(_id).card.Logo( _path, _tag );
    }

  /// @dev Set specfic source of reduction to a NEKTAR which is DRAFT
  /// @param _self stored NektarStorage structure that contains NEKTAR objects
  /// @param _id bytes32 of the NEKTAR to get identity features
  /// @param _source value to set for the NEKTAR
  /// @param _tag Label to mark flag/identify the change
  function changeSource(NektarStorage storage _self, bytes32 _id, GainSource _source, string memory _tag) external {
    _tag.notNull( "Tag");
    _self.isDraft(_id).source.change( _source, _tag );
    }

  /// @dev returns the details related to the entity
  /// @param _self stored NektarStorage structure that contains user objects
  /// @param _nektar @ID  of the NEKTAR to get features
  /// @return _data content for the given NEKTAR
  /// @return _status for the given NEKTAR
  function getNektar(NektarStorage storage _self, bytes32 _nektar) external view returns (NektarData memory _data, NektarStatus _status) {
    Nektar storage nektar = _self.isNektar(_nektar);
    (_data.name, _data.detail, _data.logo, _data.parent, ) = nektar.card.current();
    (_data.source,  ,  ) = nektar.source.current();
    (_data.currency,  ,  ) = nektar.currency.current();
    (_data.scale,  ,  ) = nektar.unit.current();
    (_status,  ,  ) = nektar.status.currentNektar();
    (_data.quantity,  ,  ) = nektar.quantity.current();
    (_data.tco,  ,  ) = nektar.tco.current();
    _data.start = nektar.start;
    _data.period = nektar.period;
    _data.from = nektar.pollen[1];
    _data.to = nektar.pollen[nektar.pollens];
    }

}
