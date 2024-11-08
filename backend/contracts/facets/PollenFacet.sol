// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {LibERC721} from "../libraries/LibERC721.sol";
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
* 1.0.2 : Version stable création et gestion des status d'un Pollen
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
    error PollenFailed(address owner, string reason);

    event PollenSetWhiteList(uint256 tokenId, T2GTypes.BusinessSector _sector);
    event PollenSetBlackList(uint256 tokenId, T2GTypes.BusinessSector _sector);
    event PollenActive( uint256 tokenId);
    event PollenAmountTransfer( uint256 tokenId);
    event PollenReview( address owner );
    event PollenRootAddressSet( address root );
    event PollenUpdated( address owner, uint256 tokenId );
    event PollenCreated( address owner, uint256 tokenId );
    event PollenStatusChanged( address owner, uint256 tokenId, LibERC721.Statusoftoken status );

    struct pollenFeatures {
        LibERC721.TokenStruct general;
        LibERC721.TokenEntitySpecific source;
        LibERC721.TokenRWASpecific rwa;
        }

    struct pollenInputs {
        LibERC721.TokenRWASpecific rwa;
        LibERC721.TokenEntitySpecific source;
        }

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

    function beacon_PollenFacet() public pure returns (string memory) { return "T2G_PollenFacet::1.0.2"; }

     /// @notice returns the address of the the contract
     /// @dev All Facet in T2G application must implement this function of type "get_<Contract Name>()
     /// @return Address of the current instance of contract
    function get_T2G_PollenFacet() public view returns (address) {
        return DiamondLoupeFacet(LibERC721.layout().root).facetAddress(bytes4(abi.encodeWithSignature("beacon_PollenFacet()")));
        }
    

     /// @notice returns the list of TokenIds related to the owner wallet
     /// @dev if msg.sender is T2G_Owner, then returns the full list of TokenId regardless owners
     /// @return Encoded Array of TokenId which are related to msg.sender wallet
    function getMyPollenList() external view returns ( bytes memory ) {
        uint256 _number = 0;

        for (uint256 i = 0; i < LibERC721.layout().allTokens.length; i++) {
            if (LibERC721.layout().token[i].token == LibERC721.Typeoftoken.Pollen ) {
                // We get the owner of the token
                address _owner = LibERC721.layout().owners[i];
                if (msg.sender == LibDiamond.contractOwner()) {
                    _number++;
                    }
                else if (LibOwners._isAllowed(msg.sender, T2GTypes.R_VIEWS ) && (_owner == msg.sender || LibERC721.layout().operatorApprovals[_owner][msg.sender])) {
                    _number++;
                    }
                }
            }

        uint256[] memory _tokens = new uint256[](_number);
        _number = 0;
        // We check first that the msg.sender if allowed and has the rights to view the pollen
        for (uint256 i = 0; i < LibERC721.layout().allTokens.length; i++) {
            // We get the owner of the token
            address _owner = LibERC721.layout().owners[i];
            if (msg.sender == LibDiamond.contractOwner()) {
                _tokens[_number++] = i;
                }
            else if (LibOwners._isAllowed(msg.sender, T2GTypes.R_VIEWS ) && (_owner == msg.sender || LibERC721.layout().operatorApprovals[_owner][msg.sender])) {
                _tokens[_number++] = i;
                }
            }
        return (abi.encode(_tokens));
        }


     /// @notice returns the features of a specific Pollen, given its tokenId 
     /// @param _tokenId token Id
     /// @dev MODIFIER : checks first that msg.sender is either the T2G owner or the token owner. Otherwise revert PollenInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to a Pollen and no other type of token. Otherwise revert PollenInvalidTokenId error
     /// @dev IMPORTANT : no checks is done if tokenId is null.
     /// @return tuple ( TokenStruct, TokenEntitySpecific, TokenRWASpecific) in abi encoded data format

    function pollen(uint256 _tokenId) 
        external isT2GOwnerOrPollenOwner(_tokenId) isPollen(_tokenId) 
        view returns ( bytes memory ) {

        // We check first that the msg.sender if allowed and has the rights to view the pollen
        if (!LibOwners._isAllowed(msg.sender, T2GTypes.R_VIEWS )) revert PollenInvalidOwner(msg.sender);

        LibERC721.TokenStruct memory data1 = LibERC721._tokenCommonFeatures(_tokenId);
        LibERC721.TokenEntitySpecific memory data2 = LibERC721._tokenEntityFeatures(_tokenId);
        LibERC721.TokenRWASpecific memory data3 = LibERC721._tokenRwaFeatures(_tokenId);
        pollenFeatures memory _result = pollenFeatures( data1, data2, data3 );
        return (abi.encode(_result));
        }

    function tokenizeGHGGains(address _to, bytes memory _data ) external isT2GOwner {

        // We check first that the _owner if allowed and has the rights to update
        if (!LibOwners._isAllowed(_to, T2GTypes.R_FARMS )) revert PollenInvalidOwner(_to);
        // Check the validity of the gain and convert it into as many pollen tokens as required

        pollenInputs memory result = abi.decode(_data, (pollenInputs));
        T2GTypes.sizeUnit _unit = result.rwa.unit;
        if (_unit == T2GTypes.sizeUnit.NONE) revert PollenInvalidAmount(_to);
        uint256 _amount = result.rwa.total * 1000 ** (uint8(_unit) - 1);

        T2GTypes.sizeUnit _size = LibERC721.layout().idFeatures[uint256(LibERC721.Typeoftoken.Pollen)].size;
        if (_size == T2GTypes.sizeUnit.NONE) revert PollenInvalidAmount(_to);
        uint256 _coin = LibERC721.layout().idFeatures[uint256(LibERC721.Typeoftoken.Pollen)].value * 1000 ** (uint8(_size) - 1);
        
        if (_amount < _coin) revert PollenInvalidAmount(_to);
        uint256 _number = _amount / _coin;

        for (uint256 i = 0; i < _number; i++) {
            try this.mintPollen( _to ) returns (uint256 _id) {
                try this.updatePollenRwa( _to, _id, abi.encode( result.rwa )) {
                    try this.updatePollenEntity( _to, _id, abi.encode( result.source )) {
                        emit PollenCreated( _to, _id); 
                        } 
                    catch Error(string memory reason) {   // catch failing revert() and require()
                        revert PollenFailed( _to, reason );
                        } 
                    catch (bytes memory reason) {         // catch failing assert()
                        revert PollenFailed( _to, string(reason) );
                        }
                    } 
                catch Error(string memory reason) {   // catch failing revert() and require()
                    revert PollenFailed( _to, reason );
                    } 
                catch (bytes memory reason) {         // catch failing assert()
                    revert PollenFailed( _to, string(reason) );
                    }
                } 
            catch Error(string memory reason) {   // catch failing revert() and require()
                    revert PollenFailed( _to, reason );
                } 
            catch (bytes memory reason) {         // catch failing assert()
                    revert PollenFailed( _to, string(reason) );
                }
            }
        }

     /// @notice Mints one Pollen Token for a specific owner address.
     /// @notice A Pollen as a fixed-quantity of GHG Gain / unit which is retrieved / updated by stakeholders
     /// @notice Emits a series of {Transfer} / {approve} events when successful
     /// @notice Emits a final PollenCreated event with the TokenId of the new Pollen
     /// @notice The newly created Pollen Token is set with a Draft status and will remain so all features have been sets & all details provided
     /// @notice Until certification, the Pollen Token can be canceled.
     /// @notice Once status is certified, the Pollen Token can no longer be canceled.
     /// @param _to address of the new Pollen token owner
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert PollenInvalidSender error
     /// @dev Checks then that future owner of new token has already signed up to the T2G app and is known. Otherwise revert PollenInvalidOwner error
     /// @dev Checks then that tokenId does not refer to no already existing token (of any type) by selecting the first non used Id in the list
     /// @dev once cheks are OK and Pollen token minted, then sets the approval flags that allow either the owner or the T2G owner to manage the token

    function mintPollen(address _to) external isT2GOwner returns (uint256 _id) {
        LibERC721.TokenStruct memory _data;

        _data.token = LibERC721.Typeoftoken.Pollen;
        _data.state = LibERC721.Statusoftoken.draft;
        _data.created = block.timestamp;
        _data.updated = _data.created;
        _data.value = LibERC721.layout().idFeatures[uint256(LibERC721.Typeoftoken.Pollen)].value;
        _data.size = LibERC721.layout().idFeatures[uint256(LibERC721.Typeoftoken.Pollen)].size;
        _data.unit = T2GTypes.CoinUnit.NONE;

        // We need to get the next _TokenId value available
        uint256 _tokenId = LibERC721.layout().allTokens.length;

        LibERC721._safeMint(_to, _tokenId, abi.encode(_data));
        LibERC721._approve(msg.sender, _tokenId, _to);
        LibERC721._setApprovalForAll(_to, msg.sender, true);
        emit PollenCreated( _to, _tokenId);
        return _tokenId;
        }

     /// @notice Update features relates to GHG Gains for the given Pollen Token
     /// @param _owner address of the new Pollen token owner
     /// @param _tokenId the Id gien to the new Pollen Token
     /// @param _data the encoded values born by the TokenRWASpecific struct
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert PollenInvalidSender error
     /// @dev Checks then that future owner of new token has already signed up to the T2G app and is known. Otherwise revert PollenInvalidOwner error
     /// @dev checks then that tokenId refers to no already existing Pollen. Otherwise revert PollenInvalidTokenId error
     /// @dev once cheks are OK, then sets the adds up the new uri to the list related to the Pollen
     /// @dev IMPORTANT : Does not check the consistency of the IPFS link and reality of the GHG Report

    function updatePollenRwa( address _owner, uint256 _tokenId, bytes memory _data ) external isT2GOwner isPollen(_tokenId) {
        // We check first that the _owner if allowed and has the rights to update
        if (!LibOwners._isAllowed(_owner, T2GTypes.R_FARMS )) revert PollenInvalidOwner(_owner);
        
        (LibERC721.TokenRWASpecific memory result) = abi.decode(_data, (LibERC721.TokenRWASpecific));
        
        if (LibERC721.layout().token[_tokenId].state != LibERC721.Statusoftoken.draft) revert PollenInvalidStatus(_tokenId);

        if (result.uri.length > 0) {
            for (uint8 i = 0; i < result.uri.length; i++ ) {
                LibERC721.layout().rwa[_tokenId].uri.push(result.uri[i]);
                }
            } 
        if (result.source > T2GTypes.GainSource.NONE) LibERC721.layout().rwa[_tokenId].source = result.source;
        if (result.scope > T2GTypes.GainScope.NONE) LibERC721.layout().rwa[_tokenId].scope = result.scope;
        if (result.gain > T2GTypes.GainType.NONE) LibERC721.layout().rwa[_tokenId].gain = result.gain;
        
        LibERC721.layout().token[_tokenId].updated = block.timestamp;
        emit PollenUpdated( _owner, _tokenId );
        }

     /// @notice Update features relates to the source Entity for the given Pollen Token
     /// @param _owner address of the new Pollen token owner
     /// @param _tokenId the Id gien to the new Pollen Token
     /// @param _data the Id gien to the new Pollen Token
     /// param _entity the value related the nature of the Entity
     /// param _sector the value related the sector of the Entity
     /// param _type the value related the type of the Entity
     /// param _size the value related the size of the Entity
     /// param _country the value related the coutry of the Entity
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert PollenInvalidSender error
     /// @dev Checks then that future owner of new token has already signed up to the T2G app and is known. Otherwise revert PollenInvalidOwner error
     /// @dev checks then that tokenId refers to no already existing Pollen. Otherwise revert PollenInvalidTokenId error
     /// @dev once cheks are OK, then sets the adds up the new uri to the list related to the Pollen
     /// @dev IMPORTANT : Does not check the consistency of the IPFS link and reality of the GHG Report

    //T2GTypes.EntityType _entity, T2GTypes.BusinessSector _sector, T2GTypes.UnitType _type, T2GTypes.UnitSize _size, T2GTypes.countries _country ) 
    
    function updatePollenEntity( address _owner, uint256 _tokenId, bytes memory _data) external isT2GOwner isPollen(_tokenId) {
        // We check first that the _owner if allowed and has the rights to update
        if (!LibOwners._isAllowed(_owner, T2GTypes.R_FARMS )) revert PollenInvalidOwner(_owner);

        if (LibERC721.layout().token[_tokenId].state != LibERC721.Statusoftoken.draft) revert PollenInvalidStatus(_tokenId);

        LibERC721.TokenEntitySpecific memory result = abi.decode(_data, (LibERC721.TokenEntitySpecific));
        
        if (bytes(result.name).length > 0) LibERC721.layout().entity[_tokenId].name = result.name;
        if (bytes(result.uid).length > 0) LibERC721.layout().entity[_tokenId].uid = result.uid;
        if (result.entity > T2GTypes.EntityType.NONE) LibERC721.layout().entity[_tokenId].entity = result.entity;
        if (result.sector > T2GTypes.BusinessSector.NONE) LibERC721.layout().entity[_tokenId].sector = result.sector;
        if (result.unitType > T2GTypes.UnitType.NONE) LibERC721.layout().entity[_tokenId].unitType = result.unitType;
        if (result.unitSize > T2GTypes.UnitSize.NONE) LibERC721.layout().entity[_tokenId].unitSize = result.unitSize;
        if (result.country > T2GTypes.countries.NONE) LibERC721.layout().entity[_tokenId].country = result.country;
        
        LibERC721.layout().token[_tokenId].updated = block.timestamp;
        emit PollenUpdated( _owner, _tokenId );
        }

     /// @notice Validate a Pollen before being certifiable
     /// @notice Only the T2G Owner can run this function on behalf of an owner of the token that has the R_FARMS profile, 
     /// @notice Both TokenId and Owner address are to be given as inputs to prevent any undesired or malicious action.
     /// @notice To validate a Pollen, it is required to update / fill up all mandatory attributes
     
    function validatePollen( address _owner, uint256 _tokenId ) external isT2GOwner isPollen(_tokenId) {
        // We check first that the _owner if allowed and has the rights to update
        if (!LibOwners._isAllowed(_owner, T2GTypes.R_FARMS )) revert PollenInvalidOwner(_owner);

        if (LibERC721.layout().token[_tokenId].state != LibERC721.Statusoftoken.draft) revert PollenInvalidStatus(_tokenId);

        LibERC721.layout().token[_tokenId].state = LibERC721.Statusoftoken.validated;
        LibERC721.layout().token[_tokenId].updated = block.timestamp;
        emit PollenStatusChanged( _owner, _tokenId, LibERC721.layout().token[_tokenId].state );
        }
    
     /// @notice Certify a Pollen 
     /// @notice Only the T2G Owner can run this function on behalf of an owner of the token that has the R_GRANTS profile, 
     /// @notice Both TokenId and Owner address are to be given as inputs to prevent any undesired or malicious action.
     /// @notice To certify a Pollen, it is required to update / fill up all mandatory attributes and to be in State : VALIDATE only

    function certifyPollen ( address _owner, uint256 _tokenId ) external isT2GOwner isPollen(_tokenId) {
        // We check first that the _owner if allowed and has the rights to update
        if (!LibOwners._isAllowed(_owner, T2GTypes.R_GRANTS )) revert PollenInvalidOwner(_owner);

        if (LibERC721.layout().token[_tokenId].state != LibERC721.Statusoftoken.validated) revert PollenInvalidStatus(_tokenId);

        LibERC721.layout().token[_tokenId].state = LibERC721.Statusoftoken.certified;
        LibERC721.layout().token[_tokenId].updated = block.timestamp;
        emit PollenStatusChanged( _owner, _tokenId, LibERC721.layout().token[_tokenId].state );
        }

     /// @notice Cancel a Pollen 
     /// @notice Only the T2G Owner can run this function on behalf of an owner of the token that has the R_FARMS profile, 
     /// @notice Both TokenId and Owner address are to be given as inputs to prevent any undesired or malicious action.
     /// @notice To cancel a Pollen, it is required to be in State : DRAFT only

    function cancelPollen ( address _owner, uint256 _tokenId ) external isT2GOwner isPollen(_tokenId) {
        // We check first that the _owner if allowed and has the rights to update
        if (!LibOwners._isAllowed(_owner, T2GTypes.R_FARMS )) revert PollenInvalidOwner(_owner);

        if (LibERC721.layout().token[_tokenId].state != LibERC721.Statusoftoken.draft) revert PollenInvalidStatus(_tokenId);

        LibERC721.layout().token[_tokenId].state = LibERC721.Statusoftoken.canceled;
        LibERC721.layout().token[_tokenId].updated = block.timestamp;
        emit PollenStatusChanged( _owner, _tokenId, LibERC721.layout().token[_tokenId].state );
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
        external isT2GOwner isPollen(_tokenId) {

        // We check first that the _owner if allowed and has the rights to update
        if (!LibOwners._isAllowed(_owner, T2GTypes.R_FARMS )) revert PollenInvalidOwner(_owner);

        if (LibERC721.layout().token[_tokenId].state != LibERC721.Statusoftoken.certified) revert PollenInvalidStatus(_tokenId);

        LibERC721._burn(_tokenId);

        LibERC721.layout().token[_tokenId].state = LibERC721.Statusoftoken.burnt;
        LibERC721.layout().token[_tokenId].updated = block.timestamp;
        emit PollenStatusChanged( _owner, _tokenId, LibERC721.layout().token[_tokenId].state );
        }

}