// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {LibERC721} from "../libraries/LibERC721.sol";
import {LibHoney} from "../libraries/LibHoney.sol";
import {ERC721Errors} from "../libraries/Errors.sol";
import {T2GTypes} from "../libraries/Types.sol";
import { LibDiamond } from "../libraries/LibDiamond.sol";
import { LibOwners } from "../libraries/LibOwners.sol";
import { ERC721Facet } from "./ERC721Facet.sol";
import { T2G_PoolFacet } from "./PoolFacet.sol";
import { EUR } from "../EurSC.sol";
import { DiamondLoupeFacet } from "./DiamondLoupeFacet.sol";
import {T2GTypes} from "../libraries/Types.sol";


/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.fr>, Github: @fdervillez
* T2G_HoneyFacet
*
* Implementation of a Trust2Give Honey Utility Token.
* Version
* 1.0.1 : Creation of the smart contract with 4 main functions
/******************************************************************************/

/// @title Contract that manages the Honey Token for Trust2Give dApp

/// Status related to a HONEY
/// Draft : At creation step of the HONEY Token, for a wallet with the R_GIVES level
/// Validated : After having completed a HONEY and proceeded to the transfer of funds from T2G-Root Wallet to T2G_Honey Wallet
/// Active : HONEY that is set to be eligible for funding and funds transfered to Pool
/// Burnt : HONEY that has been linked to POLLEN
/// Canceled : HONEY with Draft or validated status which has been disabled

contract T2G_HoneyFacet {

    //string constant seed = "honey trust truth ability flower drive early earn achieve address air amount";
    bytes32 constant privKey = 0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e;
    //bytes constant pubKey =  "0210cb8d7f0112f88e56e17050691c55f023075e825c67d67ffbd42a74242330ba";
    address constant wallet = 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199;

    error HoneyFailedTransfer(uint256 tokenId, address owner, bytes32 fund, string reason);
    error HoneyFailedApproval(address owner, address honey, string reason);
    error HoneyInvalidTokenId(uint256 tokenId);
    error HoneyInvalidOwner(address owner);
    error HoneyInvalidSender(address sender);
    error HoneyInvalidAmount(address sender);
    error HoneyInvalidContractAddress(string facet);
    error HoneyInvalidStatus(bytes32 tokenId);
    error HoneyInvalidValueUnit(uint256 tokenId, T2GTypes.CoinUnit unit);
    error HoneyInvalidBalance(address owner, uint256 balance);
    error InvalidHashTransaction();
    error ERC20InsufficientAllowance(address,uint256,uint256);
    
    event HoneySetWhiteList(bytes32 fundId, T2GTypes.BusinessSector _sector);
    event HoneySetBlackList(bytes32 fundId, T2GTypes.BusinessSector _sector);
    event HoneyActive( uint256 tokenId);
    event HoneyAmountTransfer( uint256 tokenId, address pool, uint256 value);
    event HoneyRootAddressSet( address root );
    event HoneyReview( address owner );
    event HoneyCreated( address owner, uint256 tokenId );
    event FundCreated(bytes32 fundId );
    event HoneyTrace( address _root, address _honey, address _sc, uint256 _token, address _owner );
    event EurTrace( string _from, address _sender, address _sc, address _to,uint256 _amount );

    struct honeyFeatures {
        LibERC721.TokenStruct general;
        LibERC721.TokenFundSpecific fund;
        }

    modifier isT2GOwner {
        if (msg.sender != LibDiamond.contractOwner()) revert HoneyInvalidSender(msg.sender);
        _;
        }

    modifier isHoney(uint256 _tokenId) {
        if (!LibERC721._tokenOfType( _tokenId, LibERC721.Typeoftoken.Honey )) {
            revert HoneyInvalidTokenId(_tokenId);
            }
        _;
        }

    constructor( address _root, address _stableCoin ) {
        if (_root == address(0) || _stableCoin == address(0)) revert HoneyInvalidContractAddress("Root");
        if (LibERC721.layout().root == address(0)) {
            LibERC721.layout().root = _root;
            emit HoneyRootAddressSet( _root );
            }
        else if (_root != LibERC721.layout().root) revert HoneyInvalidContractAddress("Root");

        if (_stableCoin != address(0)) {
            LibOwners.syndication().boundWallet[address(0)] = _stableCoin;
            LibOwners.syndication().boundKey[address(0)] = bytes32(0);
            emit HoneyRootAddressSet( _stableCoin );
            }
        }

     /// @notice checks that the deployed contract is alive and returns its version
     /// @dev the returned text is to be updated whenever a change in the contract is made and new deployment is carried out
     /// @return string that recalls the contact name + its current deployed version : "contractname::version"

    function beacon_HoneyFacet() public pure returns (string memory) { return "T2G_HoneyFacet::1.0.2"; }

     /// @notice returns the address of the the contract
     /// @dev All Facet in T2G application must implement this function of type "get_<Contract Name>()
     /// @return Address of the current instance of contract
     
    function get_T2G_HoneyFacet() external view returns (address) {
        return DiamondLoupeFacet(LibERC721.layout().root).facetAddress(bytes4(abi.encodeWithSignature("beacon_HoneyFacet()")));
        }

    function wallet_HoneyFacet() external pure returns ( address _wallet, bytes32 _key ) {
        //byes32 _key = generatePrivateKey( seed );
        _wallet = wallet; //address( bytes20(keccak256( bytes(pubKey) )));
        _key = privKey;
        }

    function isHoneyType(uint256 _tokenId) external view returns (bool) {
        return (LibERC721._tokenOfType( _tokenId, LibERC721.Typeoftoken.Honey ));
        }

     /// @notice Create or Update a fund object related to the funding for a possible honey
     /// @param _data the data for the new created fund
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert EntityInvalidSender error
     /// @dev this function act as a setter and overwrites an existing content with new values
     /// @dev the Id is worked out from the trasaction hash of the stablecoin transaction 
     /// @return the Id of the created fund
    
    function setFund( bytes memory _data ) external isT2GOwner returns (bytes32) {
        LibERC721.TokenFundSpecific memory result = abi.decode(_data, (LibERC721.TokenFundSpecific));
        
        // We check that the hash0 is not null and represents a valid hash format
        // Otherwise revert
        if ((result.hash0.length == 0) || (result.hash0 == 0x0)) {
            revert InvalidHashTransaction();
            }

        // We check that the unit is well of StableCoin value.
        // Otherwise revert
        if (T2GTypes.CoinUnit(result.unit) != T2GTypes.CoinUnit.T2GSC) {
            revert HoneyInvalidValueUnit(
                uint256(0), 
                T2GTypes.CoinUnit(result.unit)
                );
            }

        // Get the @W0 address where fund in stablecoin is supposed to be transfered
        address _W0 = LibOwners.syndication().boundWallet[address(this)];
        
        // Get the @ of the stablecoin contract to get the balance of the @W0 address that contains the fund in stablecoins
        EUR _stable = EUR(LibOwners.syndication().boundWallet[address(0)]);

        // Get the actual balance of the @W0 address
        uint256 _balance = _stable.balanceOf(_W0);

        // Get the list of funds available to work out the overall pool of funds
        bytes32[] memory _fundId = LibERC721.layout().allFunds;
        uint256 _pool = result.value;

        // Should hash0 be an already fundId registered in the list
        // We checks that the status is draft, to update data.
        // Otherwise revert
        // If status is None. Then we are creating a new fundId and we stack up the Id in the list
        
        LibERC721.TokenFundSpecific storage _fund = LibHoney._fund(result.hash0);

        if (_fund.state == LibERC721.Statusoftoken.None) {
            LibERC721.layout().allFunds.push(result.hash0);
            }
        else if (_fund.state > LibERC721.Statusoftoken.draft) {
            revert HoneyInvalidStatus(result.hash0);
            }

        for (uint256 i = 0; i < _fundId.length; i++ ) {

            LibERC721.TokenFundSpecific storage _pointer = LibHoney._fund(_fundId[i]);
            
            if (_pointer.state <=  LibERC721.Statusoftoken.active) {
                // Assume that unit is StableCoin.
                // Assume there is no other sate than draft or active in the balance of W0
                // Work out the balance of both draft & validated funds
                if (_fundId[i] != result.hash0) { 
                    _pool += _pointer.value;
                    } 
                }
            }

        // we check that the actual balance of @W0 address is greater than the sum of _pool + the new fund
        // Otherwise revert
        if (_balance < _pool) revert HoneyInvalidBalance( msg.sender, _balance);

        _fund.state = LibERC721.Statusoftoken.draft;
        _fund.hash0 = result.hash0;
        _fund.value = result.value;
        _fund.unit = result.unit;
        _fund.rate = result.rate;
                
        emit FundCreated( result.hash0 );
        return result.hash0;
        }

     /// @notice returns the features of a specific fund, given its rwaId 
     /// @param _fundId token Id
     /// @dev MODIFIER : checks first that msg.sender is either the T2G owner or the token owner. Otherwise revert HoneyInvalidSender error
     /// @return TokenFundSpecific object in abi encoded data format

    function fund(bytes32 _fundId) external view returns ( bytes memory ) {

        // We check first that the msg.sender if allowed and has the rights to view the pollen
        if (!LibOwners._isAllowed(msg.sender, T2GTypes.R_VIEWS )) revert HoneyInvalidSender(msg.sender);

        return (abi.encode(LibHoney._fund(_fundId)));
        }
    
    function getFunds() external view returns (bytes32[] memory _fundId) {

        // We check first that the msg.sender if allowed and has the rights to view the pollen
        if (!LibOwners._isAllowed(msg.sender, T2GTypes.R_VIEWS)) revert HoneyInvalidOwner(msg.sender);        

        //uint256[] memory _ids = LibHoney.isStateAtomic( bytes32(0), LibERC721.Statusoftoken.None );
        _fundId = LibERC721.layout().allFunds;
        }

     /// @notice returns the features of a specific Honey, given its tokenId 
     /// @param _tokenId token Id
     /// @dev MODIFIER : checks first that msg.sender is either the T2G owner or the token owner. Otherwise revert HoneyInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to a Honey and no other type of token. Otherwise revert HoneyInvalidTokenId error
     /// @dev IMPORTANT : no checks is done if tokenId is null.
     /// @return tuple (type of token, status of token, creation stamp, amount tied to token, unit of amount, rate applicable to project)

    function honey(uint256 _tokenId) external isHoney(_tokenId) view returns (bytes memory) {

        // We check first that the msg.sender if allowed and has the rights to view the pollen
        if (msg.sender != LibDiamond.contractOwner() && msg.sender != LibERC721._ownerOf(_tokenId)) revert HoneyInvalidSender(msg.sender);
        if (!LibOwners._isAllowed(msg.sender, T2GTypes.R_VIEWS )) revert HoneyInvalidOwner(msg.sender);

        LibERC721.TokenStruct memory data = LibERC721._tokenCommonFeatures(_tokenId);
        return (abi.encode(honeyFeatures( data, LibHoney._fund(data.asset) )));
        }

     /// @notice Mints as many Honey Token as required for a specific owner address.
     /// @notice Emits a series of {Transfer} / {approve} events when successful
     /// @notice Emits a final HoneyCreated event with the TokenId of the new Pollen
     /// @notice The newly created Honey Token is set with a Draft status and will remain so until the white or black list have been sets
     /// @notice YTBD: and Honey token has been approved by the T2G owner through the function approveHoney. From this moment onward, the Honey turns active
     /// @notice YTBD: Until approval, the Honey Token can be burned and canceled.
     /// @notice YTBD: Once status is active, the Honey Token can no longer be burned.T2G Owner can transfer the amount from This contract to the pool.
     /// @param _to address of the new Honey token owner
     /// @param _entity bytes32 Id of entity bound to the Honey
     /// @param _fund the transaction Hash of the transaction of value sent by _to address
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert HoneyInvalidSender error

    function mintHoney(address _to, bytes32 _entity, bytes32 _fund) external isT2GOwner {

        // We check that the _owner is allowed (registered, not banned and has rights/profile) to proceed with approval
        // Otherwise revert
        if (!LibOwners._isAllowed(_to, T2GTypes.R_GIVES)) {
            revert HoneyInvalidOwner(_to);
            }

        // Check that _fund is real and in draft status
        // Otherwise revert
        if (LibHoney._fund(_fund).state != LibERC721.Statusoftoken.draft) {
            revert HoneyInvalidStatus(_fund);
            }

        // We mint and need to get the next _TokenId value available
        uint256 _tokenId = LibHoney._mint(
            _to, 
            _entity, 
            _fund
            ); 

        // Once we have minted the right number of Honey, we turn active the entity and fund related to them
        LibERC721.layout().entity[_entity].state = LibERC721.Statusoftoken.active;
        LibHoney._fund(_fund).state = LibERC721.Statusoftoken.active;
        }

     /// @notice Updates either the white or the black list related to a specific Honey Token. Emits a HoneySetBlackList event in case of success
     /// @param _fundId the Id of the Fund Id
     /// @param _sector sector identifier to be updated in the whilelist
     /// @param _eligible flag that selects the black list (true) or the white liste (false)
     /// @dev MODIFIER : checks first that msg.sender is T2G owner or token owner. Otherwise revert HoneyInvalidSender error
     /// @dev MODIFIER : checks then that tokenId refers to no already existing Honey token. Otherwise revert HoneyInvalidTokenId error
     /// @dev IMPORTANT : no checks is done on the _sector value which is to be in the range of BusinessSector values.

    function setBlackOrWhiteList( address _owner, bytes32 _fundId, T2GTypes.BusinessSector _sector, bool _eligible ) external {
        if (!LibOwners._isAllowed(_owner, T2GTypes.R_GIVES)) revert HoneyInvalidOwner(_owner);        
        uint256[] memory _honeyIds = LibHoney.isStateAtomic(_fundId, LibERC721.Statusoftoken.draft );

        if (msg.sender != LibDiamond.contractOwner() && msg.sender != LibERC721._ownerOf(_honeyIds[0])) {
                revert HoneyInvalidSender(msg.sender);
                }

        LibERC721.layout().bwList[_fundId][uint256(_sector)] = _eligible;            
        if (_eligible) emit HoneySetWhiteList(_fundId, _sector);
        else emit HoneySetBlackList(_fundId, _sector);
        }

     /// @notice returns either the white or the black list of sectors related to a specific Honey Token.
     /// @param _fundId the Id of the Fund Id
     /// @dev MODIFIER : checks first that msg.sender is T2G owner or token owner. Otherwise revert HoneyInvalidSender error
     /// @dev MODIFIER : checks then that tokenId refers to no already existing Honey token. Otherwise revert HoneyInvalidTokenId error
     /// @return Array of flags [bool] the array size equals the range of BusinessSector values

    function getBlackOrWhiteList( bytes32 _fundId ) external view returns ( bool[] memory) {
        bool[] memory memoryArray = new bool[](uint(type(T2GTypes.BusinessSector).max));
  
        for(uint i = 0; i < uint(type(T2GTypes.BusinessSector).max); i++) {
            memoryArray[i] = LibERC721.layout().bwList[_fundId][uint256(i)];
            }
        return memoryArray;    
        }

     /// @notice Approves an Honey Token which is in draft status. From this moment onward, the Honey turns active
     /// @notice Only the T2G Owner can run this function on behalf of the owner of the token, 
     /// @notice Both TokenId and Owner address are to be given as inputs to prevent any undesired or malicious action.
     /// @notice YTBD : A Honey can not be approved until data have been set (common & specific)
     /// @notice Emits a {HoneyActive} event when successful
     /// @notice Until approval, the Honey Token can be burned and canceled.
     /// @notice Once status is active, the Honey Token can no longer be burned.T2G Owner can transfer the value from This contract to the pool.
     /// @param _fundId the Id of the Fund Id
     /// @param _owner address of the owner of the token. 
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert HoneyInvalidSender error

    function approveHoney( bytes32 _fundId, address _owner ) external isT2GOwner {

        // We check that the _owner is allowed (registered, not banned and has rights/profile) to proceed with approval
        // Otherwise revert
        if (!LibOwners._isAllowed(_owner, T2GTypes.R_GIVES)) {
            revert HoneyInvalidOwner(_owner);
            }

        // Check that _fundId is real and in active status
        // Otherwise revert
        if (LibHoney._fund(_fundId).state != LibERC721.Statusoftoken.active) {
            revert HoneyInvalidStatus(_fundId);
            }

        // We check that the HNY related to a fund are all in active Status to proceed to approval.
        // Otherwise revert
        uint256[] memory _honeyIds = LibHoney.isStateAtomic(
            _fundId, 
            LibERC721.Statusoftoken.draft 
            );

        // We check that the _owner@ is really the owner of the HNY.
        // otherwise revert.
        if (_owner != LibERC721._ownerOf(_honeyIds[0])) {
            revert HoneyInvalidOwner(_owner);
            }

        // We get the @W0 address where fund in stablecoin is supposed to be transfered from
        address _W0 = LibOwners.syndication().boundWallet[address(this)]; 
        // We get the @W1 address where fund in stablecoin is supposed to be transfered to
        address _W1 = LibOwners.syndication().boundWallet[this.get_T2G_HoneyFacet()];
        
        // We get the @ of the stablecoin contract to get the balance of the @W0 address that contains the fund in stablecoins
        EUR _stable = EUR(LibOwners.syndication().boundWallet[address(0)]);

        // event that traces the results. For testing purpose only
        // to comment when not usefull        
        emit HoneyTrace( 
            _W0, 
            address(_stable), 
            _W1, 
            _honeyIds[0], 
            _owner 
            );

        // Following assumes that         
        for (uint256 i = 0; i < _honeyIds.length; i++) {

            LibERC721.TokenStruct storage _token = LibERC721.layout().token[_honeyIds[i]];

            if (_stable.transferFrom( _W0, _W1, _token.value )) {

                _token.state = LibERC721.Statusoftoken.validated;
                } 
            else { // catch failing revert() and require()
                revert HoneyFailedTransfer( 
                    _honeyIds[i], 
                    _owner, 
                    _fundId, 
                    "" 
                    );
                }
            }
        LibHoney._fund(_fundId).state = LibERC721.Statusoftoken.validated;
        }

     /// @notice Transfers the amount of native coin related to an active Honey Token to the contract pool.
     /// @notice Only the T2G Owner can run this function on behalf of the owner of the token, 
     /// @notice Both TokenId and Owner address are to be given as inputs to prevent any undesired or malicious action.
     /// @notice Emits a {HoneyAmountTransfer} event when successful
     /// @param _fundId the Id of the Fund Id
     /// @param _owner address of the owner of the token. 
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert HoneyInvalidSender error
     /// @dev MODIFIER : checks then that _owner is the token owner. Otherwise revert HoneyInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to an already existing Honey token. Otherwise revert HoneyInvalidTokenId error
     /// @dev MODIFIER : checks then that tokenId refers to one Active Honey token. Otherwise revert HoneyInvalidStatus error
     /// @dev Once cheks are OK, then send a transfer call from this contract to the T2G_PoolFacet contract

    function transferToPool(bytes32 _fundId, address _owner) external isT2GOwner {

        if (!LibOwners._isAllowed(_owner, T2GTypes.R_GIVES)) revert HoneyInvalidOwner(_owner);
        uint256[] memory _honeyIds = LibHoney.isStateAtomic(_fundId, LibERC721.Statusoftoken.validated );
        if (_owner != LibERC721._ownerOf(_honeyIds[0])) revert HoneyInvalidOwner(_owner);

        if (LibERC721.layout().root == address(0)) revert HoneyInvalidContractAddress("Root");

        address _root = T2G_PoolFacet(LibERC721.layout().root).get_T2G_PoolFacet();
        if (_root == address(0)) revert HoneyInvalidContractAddress("PoolFacet");

        EUR _stable = EUR(LibOwners.syndication().boundWallet[address(0)]);
        address _honey = LibOwners.syndication().boundWallet[this.get_T2G_HoneyFacet()];

        for (uint256 i = 0; i < _honeyIds.length; i++) {
            // On récupère le montant de don associé Token
            LibERC721.TokenStruct memory data = LibERC721._tokenCommonFeatures(_honeyIds[i]);
            // On authorise le T2G_PoolFacet contract à agir sur le Token de Owner
            LibERC721._approve( _root, _honeyIds[i], _owner);
            // POC (Only) Check that unit is T2GSC otherwise revert
            if (T2GTypes.CoinUnit(LibERC721.layout().token[_honeyIds[i]].unit) != T2GTypes.CoinUnit.T2GSC) 
                revert HoneyInvalidValueUnit(_honeyIds[i], T2GTypes.CoinUnit(LibERC721.layout().token[_honeyIds[i]].unit));
            
            emit HoneyTrace( _root, _honey, address(_stable), data.value, _owner );
            
            if (_stable.transferFrom( _honey, _root, data.value )) {
                //LibERC721.layout().token[_honeyIds[i]].state = LibERC721.Statusoftoken.active;
                emit HoneyAmountTransfer( _honeyIds[i], _root, data.value );
                }
            else revert HoneyFailedTransfer( _honeyIds[i], _owner, _fundId, "reason" );
            }

        }

     /// @notice Burns / Cancels a draft Honey Token. For security reasons. 
     /// @notice Only the T2G Owner can run this function on behalf of the owner of the token, 
     /// @notice Both TokenId and Owner address are to be given as inputs to prevent any undesired or malicious action.
     /// @notice Emits a {HoneyBurn} event when successful
     /// @param _tokenId the Id given to the Honey Token
     /// @param _owner address of the owner of the token. 
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert HoneyInvalidSender error
     /// @dev MODIFIER : checks then that _owner is the token owner. Otherwise revert HoneyInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to an already existing Honey token. Otherwise revert HoneyInvalidTokenId error
     /// @dev MODIFIER : checks then that tokenId refers to one draft Honey token. Otherwise revert HoneyInvalidStatus error
     /// @dev YTBD : once cheks are OK, it turns the status to canceled
     /// @dev YTDB : IMPORTANT Check how to cope with "burn" in the sense of ERC721 and canceled as per T2G. Burning does not clear/erase the token
     /// @dev from the pool of tokens but rather freezes it to the Canceled state, for later tracability purposes.

    function burnHoney(uint256 _tokenId, address _owner) 
        external isT2GOwner isHoney(_tokenId) {

        if (!LibOwners._isAllowed(_owner, T2GTypes.R_GIVES)) revert HoneyInvalidOwner(_owner);
        if (_owner != LibERC721._ownerOf(_tokenId)) revert HoneyInvalidOwner(_owner);

        // We check that the status is not active, canceled ot burnt, otherwise revert
        //if (LibERC721.layout().token[_tokenId].state > LibERC721.Statusoftoken.validated) revert HoneyInvalidStatus(bytes32(0));

        //LibERC721._burn(_tokenId);
        LibERC721.layout().token[_tokenId].state = LibERC721.Statusoftoken.canceled;
        }

}