// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {LibERC721} from "../libraries/LibERC721.sol";
import {LibPollens} from "../libraries/LibPollens.sol";
import {LibEntities} from "../libraries/LibEntities.sol";
import { DiamondLoupeFacet } from "./DiamondLoupeFacet.sol";
import {T2GTypes} from "../libraries/Types.sol";
import { LibDiamond } from "../libraries/LibDiamond.sol";
import { LibOwners } from "../libraries/LibOwners.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


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

    string constant seed = "carbon trust truth ability flower earth early earn acquire action air amount";
    bytes32 constant privKey = 0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0;
    //bytes constant pubKey =  "039da9e46a1f418e12d08ae34c42f132b30d5286069b1df6fee2d6e7cb090ac72a";
    address constant wallet = 0xdD2FD4581271e230360230F9337D5c0430Bf44C0;
    
    error PollenInvalidTokenId(uint256 tokenId);
    error PollenInvalidOwner(address owner);
    error PollenInvalidSender(address sender);
    error PollenInvalidAmount(address sender);
    error PollenInvalidStatus(bytes32 tokenId);
    error PollenInvalidContractAddress();
    error PollenFailed(address owner, string reason);
    error InvalidGHGReportName();

    event PollenSetWhiteList(uint256 tokenId, T2GTypes.BusinessSector _sector);
    event PollenSetBlackList(uint256 tokenId, T2GTypes.BusinessSector _sector);
    event PollenActive( uint256 tokenId);
    event PollenAmountTransfer( uint256 tokenId);
    event PollenReview( address owner );
    event PollenRootAddressSet( address root );
    event PollenUpdated( address owner, uint256 tokenId );
    event PollenCreated( address owner, uint256 tokenId, uint256 value, uint8 unit );
    event RwaCreated( bytes32 rwaId );
    event PollenStatusChanged( address owner, uint256 tokenId, LibERC721.Statusoftoken status );

    struct pollenFeatures {
        LibERC721.TokenStruct general;
        LibERC721.TokenEntitySpecific source;
        LibERC721.TokenRWASpecific rwa;
        }

    // Modifier
    modifier isT2GOwner {
        if (msg.sender != LibDiamond.contractOwner()) revert PollenInvalidSender(msg.sender);
        _;
        }

    // Modifier
    modifier isPollen(uint256 _tokenId) {
        if (!LibERC721._tokenOfType( _tokenId, LibERC721.Typeoftoken.Pollen )) {
            revert PollenInvalidTokenId(_tokenId);
            }
        _;
        }

    // Constructor
    constructor( address _root ) {
        if (_root == address(0)) revert PollenInvalidContractAddress();
        else if (LibERC721.layout().root == address(0)) {
            LibERC721.layout().root = _root;
            emit PollenRootAddressSet( _root );
            }
        else if (_root != LibERC721.layout().root) revert PollenInvalidContractAddress();

        emit PollenRootAddressSet( address(this) );
        }

     /// @notice checks that the deployed contract is alive and returns its version
     /// @dev the returned text is to be updated whenever a change in the contract is made and new deployment is carried out
     /// @return string that recalls the contact name + its current deployed version : "contractname::version"

    function beacon_PollenFacet() public pure returns (string memory) { 
        return "T2G_PollenFacet::1.0.2"; 
        }

    function wallet_PollenFacet() external pure returns ( address _wallet, bytes32 _key ) {
        //byes32 _key = generatePrivateKey( seed );
        _wallet = wallet; //address( bytes20(keccak256( bytes(pubKey) )));
        _key = privKey;
        }

     /// @notice set the features of a Pollen Token (Value, unit, size)
     /// @param _value uint256, 
     /// @param _size T2GTypes.sizeUnit
     /// @param _unit T2GTypes.CoinUnit

    function updatePollenParams(uint256 _value, T2GTypes.sizeUnit _size, T2GTypes.CoinUnit _unit) external isT2GOwner {
        LibPollens._setParams(_value, _size, _unit);
        }

     /// @notice get the features of a Pollen Token (Value, unit, size)
     /// @return _value uint256, 
     /// @return _size T2GTypes.sizeUnit
     /// @return _unit T2GTypes.CoinUnit

    function getPollenParams() external view returns (uint256 _value, T2GTypes.sizeUnit _size, T2GTypes.CoinUnit _unit) {
        return LibPollens._getParams();
        }

    function isPollenType(uint256 _tokenId) external view returns (bool) {
        return (LibERC721._tokenOfType( _tokenId, LibERC721.Typeoftoken.Pollen ));
        }

     /* */
     /// @notice returns the address of the the contract
     /// @dev All Facet in T2G application must implement this function of type "get_<Contract Name>()
     /// @return Address of the current instance of contract
    function get_T2G_PollenFacet() public view returns (address) {
        return DiamondLoupeFacet(LibERC721.layout().root).facetAddress(bytes4(abi.encodeWithSignature("beacon_PollenFacet()")));
        }

     /* OK */
     /// @notice Update features related to the RWA for a possible pollen
     /// @param _data the data for the new created GHG Gain
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert EntityInvalidSender error
     /// @dev this function act as a setter and overwrites an existing content with new values
     /// @dev the Id is worked out from the combination of report1 & report2 which normally are enough 
     /// @dev once cheks are OK, then sets the adds the new RWA GHG Gain 
     /// @return the Id of the created RWA GHG Gain
    
    function setRwa( bytes memory _data ) external isT2GOwner returns (bytes32) {

        LibERC721.TokenRWASpecific memory result = abi.decode(_data, (LibERC721.TokenRWASpecific));
        
        if ((bytes32(result.report1).length == 0) || (bytes32(result.report1) == 0x0)) {
            revert InvalidGHGReportName();
            }

        if ((bytes32(result.report2).length == 0) || (bytes32(result.report2) == 0x0)) {
            revert InvalidGHGReportName();
            }

        bytes32 _id = keccak256( bytes(bytes.concat(result.report1, result.report2)));

        LibERC721.TokenRWASpecific storage _rwa = LibPollens._rwa(_id);

        // Check that _rwa is real and in draft status o new
        // Otherwise revert
        if (_rwa.state > LibERC721.Statusoftoken.draft) {
            revert PollenInvalidStatus(_id);
            }

        _rwa.state = LibERC721.Statusoftoken.draft;
        _rwa.value = result.value;
        _rwa.size = result.size;
        _rwa.source = result.source;
        _rwa.scope = result.scope;
        _rwa.gain = result.gain;
        _rwa.report1 = result.report1;
        _rwa.report2 = result.report2;
                
        emit RwaCreated( _id );
        return _id;
        }

     /// @notice returns the list of TokenIds related to the owner wallet
     /// @param _state State of the pollen to get NONE is all.
     /// @dev if msg.sender is T2G_Owner, then returns the full list of TokenId regardless owners
     /// @return Encoded Array of TokenId which are related to msg.sender wallet
    function getMyPollenList( LibERC721.Statusoftoken _state ) external view returns ( bytes memory ) {        

        // We check first that the msg.sender if allowed and has the rights to view the pollen
        if (!LibOwners._isAllowed(
            msg.sender, 
            T2GTypes.R_VIEWS 
            )) revert PollenInvalidOwner(msg.sender);

        uint256[] memory _tokens = LibERC721._getTokensWithEntity(bytes32(0), LibERC721.Typeoftoken.Pollen, _state);
        return (abi.encode(_tokens));
        }

     /*  OK */
     /// @notice returns the features of a specific rwa, given its rwaId 
     /// @param _rwaId token Id
     /// @dev MODIFIER : checks first that msg.sender is either the T2G owner or the token owner. Otherwise revert PollenInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to a Pollen and no other type of token. Otherwise revert PollenInvalidTokenId error
     /// @return TokenRWASpecific object in abi encoded data format

    function rwa(bytes32 _rwaId) external view returns ( bytes memory ) {
        // We check first that the msg.sender if allowed and has the rights to view the pollen
        if (!LibOwners._isAllowed(
            msg.sender, 
            T2GTypes.R_VIEWS 
            )) revert PollenInvalidOwner(msg.sender);

        return (abi.encode(LibPollens._rwa(_rwaId)));
        }

     /*  OK */
    function getRwas() external view returns (bytes32[] memory _rwaId) {
        // We check first that the msg.sender if allowed and has the rights to view the pollen

        if (!LibOwners._isAllowed(
            msg.sender, 
            T2GTypes.R_VIEWS
            )) revert PollenInvalidOwner(msg.sender);        

        _rwaId = LibERC721.layout().allRwas;
        }

     /*  OK */
     /// @notice returns the features of a specific Pollen, given its tokenId 
     /// @param _tokenId token Id
     /// @dev MODIFIER : checks then that tokenId refers to a Pollen and no other type of token. Otherwise revert PollenInvalidTokenId error
     /// @return tuple ( TokenStruct, TokenEntitySpecific, TokenRWASpecific) in abi encoded data format

    function pollen(uint256 _tokenId) 
        external isPollen(_tokenId) 
        view returns ( bytes memory ) {

        // We check first that the msg.sender if allowed and has the rights to view the pollen
        if (msg.sender != LibDiamond.contractOwner() && msg.sender != LibERC721._ownerOf(_tokenId)) revert PollenInvalidSender(msg.sender);
        if (!LibOwners._isAllowed(msg.sender, T2GTypes.R_VIEWS )) revert PollenInvalidOwner(msg.sender);

        LibERC721.TokenStruct memory data1 = LibERC721._tokenCommonFeatures(_tokenId);
        data1.owner = bytes32(0);
        data1.asset = bytes32(0);

        return (abi.encode(
            pollenFeatures( 
                data1, 
                LibEntities._entity( data1.owner ), 
                LibPollens._rwa( data1.asset ) )
                )
            );
        }
     
     /*  OK */
     /// @notice Create a Gain with as many tokens as required by the amount of the funding
     /// @param _to [Address] Wallet address of the owner of the Pollens
     /// @param _entity [bytes32] Id of the entity object that features the source of GHG gains
     /// @param _rwa [bytes32] Id of the RWA object that implements the GHG gains in CO2eq

    function mintPollens(address _to, bytes32 _entity, bytes32 _rwa ) external isT2GOwner {

        // We check first that the _owner if allowed and has the rights to update
        if (!LibOwners._isAllowed(
            _to, 
            T2GTypes.R_FARMS 
            )) revert PollenInvalidOwner(_to);
        
        LibERC721.TokenRWASpecific memory result = LibPollens._rwa(_rwa);

        // Check that _rwa is real and in draft status; otherwise revert
        if (result.state > LibERC721.Statusoftoken.draft) {
            revert PollenInvalidStatus(_rwa);
            }

        require(
            result.size > T2GTypes.sizeUnit.NONE, 
            "No RWA Unit set"
            );

        uint256 _amount = result.value * (1000 ** (uint8(result.size) - 1));

        (uint256 _coin, T2GTypes.sizeUnit _size, ) = LibPollens._getParams();

        require( 
            _coin > 0, 
            "Zero Pollen Value"
            );

        require( 
            _size > T2GTypes.sizeUnit.NONE, 
            "No Pollen Unit"
            );

        _coin = _coin * (1000 ** (uint8(_size) - 1));
        
        require( 
            _amount >= _coin, 
            string.concat( "Not enough gains : ", Strings.toString(_amount) )
            );

        for (uint256 i = _amount; (i - _coin) >= 0; i = i - _coin) {
            LibPollens._mint( 
                _to, 
                _entity, 
                _rwa 
                );
            }

        // Once we have minted the right number of Pollen, we turn active the entity and rwa related to them
        LibERC721.layout().entity[_entity].state = LibERC721.Statusoftoken.active;
        LibERC721.layout().rwa[_rwa].state = LibERC721.Statusoftoken.active;
        }


     /// @notice Validate a gain made up of several Pollens before being certifiable
     /// @notice Only the T2G Owner can run this function on behalf of an owner of the tokens that has the R_FARMS profile, 
     /// @notice Both _rwa and _owner address are to be given as inputs to prevent any undesired or malicious action.
     /// @notice To validate a Pollen, it is required to update / fill up all mandatory attributes
     /// @param _owner address of the owner
     /// @param _rwa bytes32 Id of the old reference to RWA features
     
    function validatePollens(address _owner, bytes32 _rwa) external isT2GOwner {
        // We check first that the _owner if allowed and has the rights to update
        if (!LibOwners._isAllowed(_owner, T2GTypes.R_FARMS )) revert PollenInvalidOwner(_owner);

        uint256[] memory _pollens = LibPollens.isStateAtomic( _rwa, LibERC721.Statusoftoken.draft );
        for (uint256 i = 0; i < _pollens.length; i++) {
            LibERC721.layout().token[_pollens[i]].state = LibERC721.Statusoftoken.validated;
            LibERC721.layout().token[_pollens[i]].updated = block.timestamp;
            emit PollenStatusChanged( _owner, _pollens[i], LibERC721.layout().token[_pollens[i]].state );
            }
        }

     /// @notice Certify a set of Pollens lined to a Gain 
     /// @notice Only the T2G Owner can run this function on behalf of an owner of the token that has the R_GRANTS profile, 
     /// @notice Both TokenId and Owner address are to be given as inputs to prevent any undesired or malicious action.
     /// @notice To certify a Pollen, it is required to update / fill up all mandatory attributes and to be in State : VALIDATE only
     /// @param _owner address of the owner
     /// @param _rwa bytes32 Id of the old reference to RWA features

    function certifyPollens(address _owner, bytes32 _rwa) external isT2GOwner {
        // We check first that the _owner if allowed and has the rights to update
        if (!LibOwners._isAllowed(_owner, T2GTypes.R_FARMS )) revert PollenInvalidOwner(_owner);

        uint256[] memory _pollens = LibPollens.isStateAtomic( _rwa, LibERC721.Statusoftoken.validated );
        for (uint256 i = 0; i < _pollens.length; i++) {
            LibERC721.layout().token[_pollens[i]].state = LibERC721.Statusoftoken.certified;
            LibERC721.layout().token[_pollens[i]].updated = block.timestamp;
            emit PollenStatusChanged( _owner, _pollens[i], LibERC721.layout().token[_pollens[i]].state );
            }
        }

     /// @notice Cancel a Pollen 
     /// @notice Only the T2G Owner can run this function on behalf of an owner of the token that has the R_FARMS profile, 
     /// @notice Both TokenId and Owner address are to be given as inputs to prevent any undesired or malicious action.
     /// @notice To cancel a Pollen, it is required to be in State : DRAFT only

    function cancelPollen ( address _owner, bytes32 _tokenId ) external isT2GOwner {
        // We check first that the _owner if allowed and has the rights to update
        if (!LibOwners._isAllowed(_owner, T2GTypes.R_FARMS )) revert PollenInvalidOwner(_owner);
/*
        if (LibERC721.layout().token[_tokenId].state != LibERC721.Statusoftoken.draft) revert PollenInvalidStatus(_tokenId);

        LibERC721.layout().token[_tokenId].state = LibERC721.Statusoftoken.canceled;
        LibERC721.layout().token[_tokenId].updated = block.timestamp;
        emit PollenStatusChanged( _owner, _tokenId, LibERC721.layout().token[_tokenId].state );*/
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

    function burnPollen(bytes32 _tokenId, address _owner) 
        external isT2GOwner {

        // We check first that the _owner if allowed and has the rights to update
        if (!LibOwners._isAllowed(_owner, T2GTypes.R_FARMS )) revert PollenInvalidOwner(_owner);
/*
        if (LibERC721.layout().token[_tokenId].state != LibERC721.Statusoftoken.certified) revert PollenInvalidStatus(_tokenId);

        LibERC721._burn(_tokenId);

        LibERC721.layout().token[_tokenId].state = LibERC721.Statusoftoken.burnt;
        LibERC721.layout().token[_tokenId].updated = block.timestamp;
        emit PollenStatusChanged( _owner, _tokenId, LibERC721.layout().token[_tokenId].state );*/
        }

}