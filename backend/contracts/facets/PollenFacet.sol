// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {LibERC721} from "../libraries/LibERC721.sol";
//import {ERC721Errors} from "../libraries/Errors.sol";
import { DiamondLoupeFacet } from "./DiamondLoupeFacet.sol";
import {T2GTypes} from "../libraries/Types.sol";
import { LibDiamond } from "../libraries/LibDiamond.sol";
import { LibOwners } from "../libraries/LibOwners.sol";


/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.fr>, Github: @fdervillez
* T2G_PollenFacet
*
* Implementation of a Trust2Give Pollen Utility Token.
* Version
* 1.0.1 : Creation of the smart contract with 4 main functions
/******************************************************************************/

/// @title Contract that manages the Pollen Token for Trust2Give dApp

/// Status related to a POLLEN
/// Draft : At creation step of the POLLEN Token, by a wallet with the R_FARMS level
/// Validated : After having completed a POLLEN and proceeded to validation from a wallet with R_FARMS level
/// Certified : POLLEN certified by a wallet with R_GRANTS level, that complies to reduction target objectives and to the clear and sound calculation rules
/// Active : POLLEN that is set by a R_COLLECTS level to be eligible for funding
/// Burnt : POLLEN that has been turned to funds
/// Canceled : POLLEN with Draft or validated status which has been disabled by a wallet with R_FARMER or R_GRANTS levels

contract T2G_PollenFacet {

    error PollenInvalidTokenId(uint256 tokenId);
    error PollenInvalidOwner(address owner);
    error PollenInvalidSender(address sender);
    error PollenInvalidAmount(address sender);
    error PollenInvalidStatus(uint256 tokenId);
    error PollenInvalidContractAddress();

    event PollenSetWhiteList(uint256 tokenId, T2GTypes.BusinessSector _sector);
    event PollenSetBlackList(uint256 tokenId, T2GTypes.BusinessSector _sector);
    event PollenActive( uint256 tokenId);
    event PollenAmountTransfer( uint256 tokenId);
    event PollenReview( address owner );
    event PollenRootAddressSet( address root );

    modifier isT2GOwner {
        if (msg.sender != LibDiamond.contractOwner()) revert PollenInvalidSender(msg.sender);
        _;
        }

    modifier isT2GOwnerOrPollenOwner(uint256 _tokenId) {
        if (msg.sender != LibDiamond.contractOwner() && msg.sender != LibERC721._ownerOf(_tokenId)) {
                revert PollenInvalidSender(msg.sender);
                }
        _;
        }

    modifier isPollen(uint256 _tokenId) {
        if (!LibERC721._tokenOfType( _tokenId, LibERC721.Typeoftoken.Pollen )) {
            revert PollenInvalidTokenId(_tokenId);
            }
        _;
        }

    modifier isDraft(uint256 _tokenId) {
        if (LibERC721.layout().token[_tokenId].state != LibERC721.Statusoftoken.draft) {
            revert PollenInvalidStatus(_tokenId);
            }
        _;
        }

    modifier isActive(uint256 _tokenId) {
        if (LibERC721.layout().token[_tokenId].state != LibERC721.Statusoftoken.active) {
            revert PollenInvalidStatus(_tokenId);
            }
        _;
        }

    constructor( address _root ) {
        if (_root == address(0)) revert PollenInvalidContractAddress();
        else if (LibERC721.layout().root == address(0)) {
            LibERC721.layout().root = _root;
            emit PollenRootAddressSet( _root );
            }
        else if (_root != LibERC721.layout().root) revert PollenInvalidContractAddress();
        }

     /// @notice checks that the deployed contract is alive and returns its version
     /// @dev the returned text is to be updated whenever a change in the contract is made and new deployment is carried out
     /// @return string that recalls the contact name + its current deployed version : "contractname::version"

    function beacon_PollenFacet() public pure returns (string memory) { return "T2G_PollenFacet::1.0.9"; }

     /// @notice returns the address of the the contract
     /// @dev All Facet in T2G application must implement this function of type "get_<Contract Name>()
     /// @return Address of the current instance of contract
    function get_T2G_PollenFacet() public view returns (address) {
        return DiamondLoupeFacet(LibERC721.layout().root).facetAddress(bytes4(abi.encodeWithSignature("beacon_PollenFacet()")));
        }

     /// @notice returns the common features of a specific Pollen, given its tokenId 
     /// @param _tokenId token Id
     /// @dev MODIFIER : checks first that msg.sender is either the T2G owner or the token owner. Otherwise revert PollenInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to a Pollen and no other type of token. Otherwise revert PollenInvalidTokenId error
     /// @dev IMPORTANT : no checks is done if tokenId is null.
     /// @return tuple (type of token, status of token, creation stamp, amount tied to token, unit of amount)

    function pollen(uint256 _tokenId) 
        external isT2GOwnerOrPollenOwner(_tokenId) isPollen(_tokenId) 
        view returns (LibERC721.Typeoftoken , LibERC721.Statusoftoken, uint256, uint256, T2GTypes.sizeUnit) {

        LibERC721.TokenStruct memory data = LibERC721._tokenCommonFeatures(_tokenId);

        return (data.token, data.state, data.created, data.value, LibERC721.layout().rwa[_tokenId].valueUnit);
        }

     /// @notice returns the specific features of a specific Pollen, related to entity, given its tokenId 
     /// @param _tokenId token Id
     /// @dev MODIFIER : checks first that msg.sender is either the T2G owner or the token owner. Otherwise revert PollenInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to a Pollen and no other type of token. Otherwise revert PollenInvalidTokenId error
     /// @dev IMPORTANT : no checks is done if tokenId is null.
     /// @return tuple (sector, name, uid) for the entity

    function pollenEntityIdentity(uint256 _tokenId) 
        external isT2GOwnerOrPollenOwner(_tokenId) isPollen(_tokenId) 
        view returns ( T2GTypes.BusinessSector, string memory, string memory ) {

        LibERC721.TokenEntitySpecific memory data = LibERC721._tokenEntityFeatures(_tokenId);

        return ( data.sector, data.name, data.uid );
        }

     /// @notice returns the specific features of a specific Pollen, related to entity, given its tokenId 
     /// @param _tokenId token Id
     /// @dev MODIFIER : checks first that msg.sender is either the T2G owner or the token owner. Otherwise revert PollenInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to a Pollen and no other type of token. Otherwise revert PollenInvalidTokenId error
     /// @dev IMPORTANT : no checks is done if tokenId is null.
     /// @return tuple (sector, name, uid) for the entity

    function pollenEntityFeatures(uint256 _tokenId) 
        external isT2GOwnerOrPollenOwner(_tokenId) isPollen(_tokenId) 
        view returns ( T2GTypes.EntityType, T2GTypes.UnitType , T2GTypes.UnitSize , T2GTypes.countries ) {

        LibERC721.TokenEntitySpecific memory data = LibERC721._tokenEntityFeatures(_tokenId);

        return ( data.entity, data.unitType, data.unitSize, data.country );
        }

     /// @notice returns the specific features of a specific Pollen, related to gains given its tokenId 
     /// @param _tokenId token Id
     /// @dev MODIFIER : checks first that msg.sender is either the T2G owner or the token owner. Otherwise revert PollenInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to a Pollen and no other type of token. Otherwise revert PollenInvalidTokenId error
     /// @dev IMPORTANT : no checks is done if tokenId is null.
     /// @return tuple (gain, scope, source)

    function pollenGainFeatures(uint256 _tokenId) 
        external isT2GOwnerOrPollenOwner(_tokenId) isPollen(_tokenId) 
        view returns (T2GTypes.GainType, T2GTypes.GainScope, T2GTypes.GainSource) {

        LibERC721.TokenRWASpecific memory data = LibERC721._tokenRwaFeatures(_tokenId);

        return (data.gain, data.scope, data.source);
        }

     /// @notice Mints a new Pollen Token for a specific owner address. Emits a {Transfer} event when successful
     /// @notice The newly created Pollen Token is set with a Draft status and will remain so until the GHG Report URI have been sets & all details provided
     /// @notice YTBD: Until certification, the Pollen Token can be canceled.
     /// @notice YTBD: Once status is certified, the Pollen Token can no longer be canceled.
     /// @param _to address of the new Pollen token owner
     /// @param _tokenId the Id gien to the new Pollen Token
     /// @param _quantity the quantity gained
     /// @param _unit the size unit of the quantity
     /// @param _name the size unit of the quantity
     /// @param _uid the size unit of the quantity
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert PollenInvalidSender error
     /// @dev Checks then that future owner of new token has already signed up to the T2G app and is known. Otherwise revert PollenInvalidOwner error
     /// @dev YTBD checks then that tokenId does not refer to no already existing token (of any type). Otherwise revert PollenInvalidTokenId error
     /// @dev once cheks are OK and Pollen token minted, then sets the approval flags that allow either the owner or the T2G owner to manage the token

    function mintPollen(address _to, uint256 _tokenId, uint256 _quantity, T2GTypes.sizeUnit _unit, string memory _name, string memory  _uid) 
        external isT2GOwner {
        LibERC721.TokenStruct memory _data;

        // We check first that the _owner if allowed and has the rights to update
        if (!LibOwners._isAllowed(_to, T2GTypes.R_FARMS )) revert PollenInvalidOwner(_to);

        _data.token = LibERC721.Typeoftoken.Pollen;
        _data.state = LibERC721.Statusoftoken.draft;
        _data.value = _quantity;
        _data.created = block.timestamp;
        _data.updated = _data.created;

        LibERC721._safeMint(_to, _tokenId, abi.encode(_data));
        LibERC721._approve(msg.sender, _tokenId, _to);
        LibERC721._setApprovalForAll(_to, msg.sender, true);

        LibERC721.layout().rwa[_tokenId].valueUnit = _unit;
        LibERC721.layout().entity[_tokenId].name = _name;
        LibERC721.layout().entity[_tokenId].uid = _uid;
        }

     /// @notice Append or Update GHG Reports URI to a Pollen Token
     /// @param _owner address of the new Pollen token owner
     /// @param _tokenId the Id gien to the new Pollen Token
     /// @param _uri the IPFS uri of the GHG Report that testify the GHG Gain
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert PollenInvalidSender error
     /// @dev Checks then that future owner of new token has already signed up to the T2G app and is known. Otherwise revert PollenInvalidOwner error
     /// @dev checks then that tokenId refers to no already existing Pollen. Otherwise revert PollenInvalidTokenId error
     /// @dev once cheks are OK, then sets the adds up the new uri to the list related to the Pollen
     /// @dev IMPORTANT : Does not check the consistency of the IPFS link and reality of the GHG Report

    function updatePollenGHGReport( address _owner, uint256 _tokenId, string memory _uri ) external isT2GOwner isPollen(_tokenId) {
        // We check first that the _owner if allowed and has the rights to update
        if (!LibOwners._isAllowed(_owner, T2GTypes.R_FARMS )) revert PollenInvalidOwner(_owner);
        LibERC721.layout().rwa[_tokenId].uri.push(_uri);
        LibERC721.layout().token[_tokenId].updated = block.timestamp;
        }

     /// @notice Update features relates to GHG Gains for the given Pollen Token
     /// @param _owner address of the new Pollen token owner
     /// @param _tokenId the Id gien to the new Pollen Token
     /// @param _source the value related the source of the Gain
     /// @param _scope the value related the scope of the Gain
     /// @param _gain the value related the type of the Gain
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert PollenInvalidSender error
     /// @dev Checks then that future owner of new token has already signed up to the T2G app and is known. Otherwise revert PollenInvalidOwner error
     /// @dev checks then that tokenId refers to no already existing Pollen. Otherwise revert PollenInvalidTokenId error
     /// @dev once cheks are OK, then sets the adds up the new uri to the list related to the Pollen
     /// @dev IMPORTANT : Does not check the consistency of the IPFS link and reality of the GHG Report

    function updatePollenGains( address _owner, uint256 _tokenId, T2GTypes.GainSource _source, T2GTypes.GainScope _scope, T2GTypes.GainType _gain ) 
        external isT2GOwner isPollen(_tokenId) {
        // We check first that the _owner if allowed and has the rights to update
        if (!LibOwners._isAllowed(_owner, T2GTypes.R_FARMS )) revert PollenInvalidOwner(_owner);
        LibERC721.layout().rwa[_tokenId].source = _source;
        LibERC721.layout().rwa[_tokenId].scope = _scope;
        LibERC721.layout().rwa[_tokenId].gain = _gain;
        LibERC721.layout().token[_tokenId].updated = block.timestamp;
        }

     /// @notice Update features relates to the source Entity for the given Pollen Token
     /// @param _owner address of the new Pollen token owner
     /// @param _tokenId the Id gien to the new Pollen Token
     /// @param _entity the value related the nature of the Entity
     /// @param _sector the value related the sector of the Entity
     /// @param _type the value related the type of the Entity
     /// @param _size the value related the size of the Entity
     /// @param _country the value related the coutry of the Entity
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert PollenInvalidSender error
     /// @dev Checks then that future owner of new token has already signed up to the T2G app and is known. Otherwise revert PollenInvalidOwner error
     /// @dev checks then that tokenId refers to no already existing Pollen. Otherwise revert PollenInvalidTokenId error
     /// @dev once cheks are OK, then sets the adds up the new uri to the list related to the Pollen
     /// @dev IMPORTANT : Does not check the consistency of the IPFS link and reality of the GHG Report

    function updatePollenEntity( address _owner, uint256 _tokenId, T2GTypes.EntityType _entity, T2GTypes.BusinessSector _sector, T2GTypes.UnitType _type, T2GTypes.UnitSize _size, T2GTypes.countries _country ) 
        external isT2GOwner isPollen(_tokenId) {
        // We check first that the _owner if allowed and has the rights to update
        if (!LibOwners._isAllowed(_owner, T2GTypes.R_FARMS )) revert PollenInvalidOwner(_owner);
        LibERC721.layout().entity[_tokenId].entity = _entity;
        LibERC721.layout().entity[_tokenId].sector = _sector;
        LibERC721.layout().entity[_tokenId].unitType = _type;
        LibERC721.layout().entity[_tokenId].unitSize = _size;
        LibERC721.layout().entity[_tokenId].country = _country;
        LibERC721.layout().token[_tokenId].updated = block.timestamp;
        }

    function validatePollen( address _owner, uint256 _tokenId ) external isT2GOwner {
        // We check first that the _owner if allowed and has the rights to update
        if (!LibOwners._isAllowed(_owner, T2GTypes.R_FARMS )) revert PollenInvalidOwner(_owner);

        }
    
    function certifyPollen ( address _owner, uint256 _tokenId ) external isT2GOwner {
        // We check first that the _owner if allowed and has the rights to update
        if (!LibOwners._isAllowed(_owner, T2GTypes.R_GRANTS )) revert PollenInvalidOwner(_owner);

        }

    function cancelPollen ( address _owner, uint256 _tokenId ) external isT2GOwner {
        // We check first that the _owner if allowed and has the rights to update
        if (!LibOwners._isAllowed(_owner, T2GTypes.R_FARMS )) revert PollenInvalidOwner(_owner);

        }

     /// @notice Burns / Cancels a draft Pollen Token. For security reasons. 
     /// @notice Only the T2G Owner can run this function on behalf of the owner of the token, 
     /// @notice Both TokenId and Owner address are to be given as inputs to prevent any undesired or malicious action.
     /// @notice Emits a {PollenBurn} event when successful
     /// @param _tokenId the Id given to the Pollen Token
     /// @param _owner address of the owner of the token. 
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert PollenInvalidSender error
     /// @dev MODIFIER : checks then that _owner is the token owner. Otherwise revert PollenInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to an already existing Pollen token. Otherwise revert PollenInvalidTokenId error
     /// @dev MODIFIER : checks then that tokenId refers to one draft Pollen token. Otherwise revert PollenInvalidStatus error
     /// @dev YTBD : once cheks are OK, it turns the status to canceled
     /// @dev YTDB : IMPORTANT Check how to cope with "burn" in the sense of ERC721 and canceled as per T2G. Burning does not clear/erase the token
     /// @dev from the pool of tokens but rather freezes it to the Canceled state, for later tracability purposes.

    function burnPollen(uint256 _tokenId, address _owner) 
        external isT2GOwner isPollen(_tokenId) isDraft(_tokenId) {

        if (_owner != LibERC721._ownerOf(_tokenId)) revert PollenInvalidOwner(_owner);
        if (!LibOwners._isAllowed(_owner, T2GTypes.R_FARMS )) revert PollenInvalidOwner(_owner);

        if (LibERC721._tokenOfType( _tokenId, LibERC721.Typeoftoken.Pollen )) {
            LibERC721._burn(_tokenId);
            }
        revert PollenInvalidTokenId(_tokenId);
        }

}