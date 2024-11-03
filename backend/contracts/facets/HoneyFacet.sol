// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {LibERC721} from "../libraries/LibERC721.sol";
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

    error HoneyFailedTransfer(uint256 tokenId, address owner, address honey, string reason);
    error HoneyFailedApproval(uint256 tokenId, address owner, address honey, string reason);
    error HoneyInvalidTokenId(uint256 tokenId);
    error HoneyInvalidOwner(address owner);
    error HoneyInvalidSender(address sender);
    error HoneyInvalidAmount(address sender);
    error HoneyInvalidContractAddress(string facet);
    error HoneyInvalidStatus(uint256 tokenId);
    error HoneyInvalidValueUnit(uint256 tokenId, T2GTypes.CoinUnit unit);
    error HoneyInvalidBalance(address owner, uint256 balance);

    event HoneySetWhiteList(uint256 tokenId, T2GTypes.BusinessSector _sector);
    event HoneySetBlackList(uint256 tokenId, T2GTypes.BusinessSector _sector);
    event HoneyActive( uint256 tokenId);
    event HoneyAmountTransfer( uint256 tokenId, address pool, uint256 value);
    event HoneyRootAddressSet( address root );
    event HoneyReview( address owner );

    event HoneyTrace( address _root, address _honey, address _sc, uint256 _token, address _owner );

    modifier isT2GOwner {
        if (msg.sender != LibDiamond.contractOwner()) revert HoneyInvalidSender(msg.sender);
        _;
        }

    modifier isT2GOwnerOrHoneyOwner(uint256 _tokenId) {
        if (msg.sender != LibDiamond.contractOwner() && msg.sender != LibERC721._ownerOf(_tokenId)) {
                revert HoneyInvalidSender(msg.sender);
                }
        _;
        }

    modifier isHoney(uint256 _tokenId) {
        if (!LibERC721._tokenOfType( _tokenId, LibERC721.Typeoftoken.Honey )) {
            revert HoneyInvalidTokenId(_tokenId);
            }
        _;
        }

    modifier isDraft(uint256 _tokenId) {
        if (LibERC721.layout().token[_tokenId].state != LibERC721.Statusoftoken.draft) {
            revert HoneyInvalidStatus(_tokenId);
            }
        _;
        }

    modifier isValidated(uint256 _tokenId) {
        if (LibERC721.layout().token[_tokenId].state != LibERC721.Statusoftoken.validated) {
            revert HoneyInvalidStatus(_tokenId);
            }
        _;
        }

    modifier isRootValid {
        if (LibERC721.layout().root == address(0)) revert HoneyInvalidContractAddress("Root");
        _;
        }

    constructor( address _root ) {
        if (_root == address(0)) revert HoneyInvalidContractAddress("Root");
        else if (LibERC721.layout().root == address(0)) {
            LibERC721.layout().root = _root;
            emit HoneyRootAddressSet( _root );
            }
        else if (_root != LibERC721.layout().root) revert HoneyInvalidContractAddress("Root");
        }

     /// @notice checks that the deployed contract is alive and returns its version
     /// @dev the returned text is to be updated whenever a change in the contract is made and new deployment is carried out
     /// @return string that recalls the contact name + its current deployed version : "contractname::version"

    function beacon_HoneyFacet() public pure returns (string memory) { return "T2G_HoneyFacet::1.0.2"; }

     /// @notice returns the address of the the contract
     /// @dev All Facet in T2G application must implement this function of type "get_<Contract Name>()
     /// @return Address of the current instance of contract
     
    function get_T2G_HoneyFacet() public view returns (address) {
        return DiamondLoupeFacet(LibERC721.layout().root).facetAddress(bytes4(abi.encodeWithSignature("beacon_HoneyFacet()")));
        }

     /// @notice returns the features of a specific Honey, given its tokenId 
     /// @param _tokenId token Id
     /// @dev MODIFIER : checks first that msg.sender is either the T2G owner or the token owner. Otherwise revert HoneyInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to a Honey and no other type of token. Otherwise revert HoneyInvalidTokenId error
     /// @dev IMPORTANT : no checks is done if tokenId is null.
     /// @return tuple (type of token, status of token, creation stamp, amount tied to token, unit of amount, rate applicable to project)

    function honey(uint256 _tokenId) 
        external isT2GOwnerOrHoneyOwner(_tokenId) isHoney(_tokenId) 
        view returns (LibERC721.Typeoftoken , LibERC721.Statusoftoken, uint256, uint256, T2GTypes.CoinUnit, uint8) {
        LibERC721.TokenStruct memory data = LibERC721._tokenCommonFeatures(_tokenId);
        LibERC721.TokenFundSpecific memory fund = LibERC721._tokenFundFeatures(_tokenId);

        return (data.token, data.state, data.created, data.value, fund.valueUnit, fund.rate);
        }

     /// @notice Mints a new Honey Token for a specific owner address. Emits a {Transfer} event when successful
     /// @notice This is a payable function that requires msg.value represents the amount of gift that is related to the Honey Token
     /// @notice Minting Honey with no msg.value or zero is not permitted. Value represent the amoung in native coin (T2GSC) that is given by the owner to T2G apps
     /// @notice The newly created Honey Token is set with a Draft status and will remain so until the white or black list have been sets
     /// @notice YTBD: and Honey token has been approved by the T2G owner through the function approveHoney. From this moment onward, the Honey turns active
     /// @notice YTBD: Until approval, the Honey Token can be burned and canceled.
     /// @notice YTBD: Once status is active, the Honey Token can no longer be burned.T2G Owner can transfer the amount from This contract to the pool.
     /// @param _to address of the new Honey token owner
     /// @param _tokenId the Id gien to the new Honey Token
     /// @param _value the value of the amount given
     /// @param _unit the unit of the amount given
     /// @param _rate the percentage of the amount dedicated to gift
     /// @param _tx the transaction Hash of the transaction of value sent by _to address
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert HoneyInvalidSender error
     /// @dev MODIFIER : checks then that future owner of new token has already signed up to the T2G app and is not banned. Otherwise revert HoneyInvalidOwner error
     /// @dev checks then that tokenId does not refer to no already existing token (of any type). Otherwise revert HoneyInvalidTokenId error
     /// @dev once cheks are OK and Honey token minted, then sets the approval flags that allow either the owner or the T2G owner to manage the token

    function mintHoney(address _to, uint256 _tokenId, uint256 _value, T2GTypes.CoinUnit _unit, uint8 _rate, string memory _tx) 
        external isT2GOwner {
        LibERC721.TokenStruct memory _data;
        
        if (!LibOwners._isAllowed(_to, T2GTypes.R_GIVES)) revert HoneyInvalidOwner(_to);

        // We neet to check that the StableCoin balance of T2G_Owner wallet has suffisant amount to cover up the Honey amount

        address _honey = get_T2G_HoneyFacet();
        EUR _eurSC = EUR(LibOwners.syndication().scAddress);
        uint256 _balance = _eurSC.balanceOf(LibERC721.layout().root);

        if (_balance < _value) revert HoneyInvalidBalance( _to, _balance);

        try _eurSC.approve(_honey, _balance) returns (bool) {

            emit HoneyTrace( address(this), _honey, address(_eurSC), _tokenId, _to );

            _data.token = LibERC721.Typeoftoken.Honey;
            _data.state = LibERC721.Statusoftoken.draft;
            _data.value = _value;
            _data.created = block.timestamp;
            _data.updated = _data.created;

            LibERC721._safeMint(_to, _tokenId, abi.encode(_data));
            LibERC721._approve(msg.sender, _tokenId, _to);
            LibERC721._setApprovalForAll(_to, msg.sender, true);

            LibERC721.layout().fund[_tokenId].hash.push(_tx);
            LibERC721.layout().fund[_tokenId].rate = _rate;
            LibERC721.layout().fund[_tokenId].valueUnit = _unit;

            } catch Error(string memory reason) {   // catch failing revert() and require()
                revert HoneyFailedApproval( _tokenId, _to, _honey, reason );
            } catch (bytes memory reason) {         // catch failing assert()
                revert HoneyFailedApproval( _tokenId, _to, _honey, string(reason) );
            }
        }

     /// @notice Append a new Tx Hash to a Honey Token
     /// @param _owner address of the new Honey token owner
     /// @param _tokenId the Id gien to the new Honey Token
     /// @param _tx the list of Tx Hashs
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert HoneyInvalidSender error
     /// @dev Checks then that future owner of new token has already signed up to the T2G app and is known. Otherwise revert HoneyInvalidOwner error
     /// @dev YTBD checks then that tokenId does not refer to no already existing token (of any type). Otherwise revert HoneyInvalidTokenId error
     /// @dev YTBD once cheks are OK and Honey token minted, then sets the approval flags that allow either the owner or the T2G owner to manage the token

    function addHoneyTxHash( address _owner, uint256 _tokenId, string memory _tx ) external isT2GOwner {
        if (!LibOwners._isAllowed(_owner, T2GTypes.R_GIVES )) revert HoneyInvalidOwner(_owner);
        LibERC721.layout().fund[_tokenId].hash.push(_tx);
        }

     /// @notice Updates either the white or the black list related to a specific Honey Token. Emits a HoneySetBlackList event in case of success
     /// @param _tokenId the Id of the HoneyId
     /// @param _sector sector identifier to be updated in the whilelist
     /// @param _blacklist flag that selects the black list (true) or the white liste (false)
     /// @param _remove flag that add (false) or remove (true) the sector to the black list
     /// @dev MODIFIER : checks first that msg.sender is T2G owner or token owner. Otherwise revert HoneyInvalidSender error
     /// @dev MODIFIER : checks then that tokenId refers to no already existing Honey token. Otherwise revert HoneyInvalidTokenId error
     /// @dev IMPORTANT : no checks is done on the _sector value which is to be in the range of BusinessSector values.

    function setBlackOrWhiteList( uint256 _tokenId, T2GTypes.BusinessSector _sector, bool _blacklist, bool _remove ) 
        external isT2GOwnerOrHoneyOwner(_tokenId) isHoney(_tokenId) {
        if (_blacklist) {
            LibERC721.layout().blacklist[_tokenId][uint256(_sector)] = _remove ? false : true;            
            emit HoneySetBlackList(_tokenId, _sector);
            }
        else {
            LibERC721.layout().whitelist[_tokenId][uint256(_sector)] = _remove ? false : true;        
            emit HoneySetWhiteList(_tokenId, _sector);
            }
        }

     /// @notice returns either the white or the black list of sectors related to a specific Honey Token.
     /// @param _tokenId the Id of the HoneyId
     /// @param _blacklist flag that selects the black list (true) or the white liste (false)
     /// @dev MODIFIER : checks first that msg.sender is T2G owner or token owner. Otherwise revert HoneyInvalidSender error
     /// @dev MODIFIER : checks then that tokenId refers to no already existing Honey token. Otherwise revert HoneyInvalidTokenId error
     /// @return Array of flags [bool] the array size equals the range of BusinessSector values

    function getBlackOrWhiteList( uint256 _tokenId, bool _blacklist ) 
        external isT2GOwnerOrHoneyOwner(_tokenId) isHoney(_tokenId) view returns ( bool[] memory) {
        bool[] memory memoryArray = new bool[](uint(type(T2GTypes.BusinessSector).max));
        for(uint i = 0; i < uint(type(T2GTypes.BusinessSector).max); i++) {
            if (_blacklist) {
                memoryArray[i] = LibERC721.layout().blacklist[_tokenId][i];
                }
            else {
                memoryArray[i] = LibERC721.layout().whitelist[_tokenId][i];
                }
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
     /// @param _tokenId the Id given to the Honey Token
     /// @param _owner address of the owner of the token. 
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert HoneyInvalidSender error
     /// @dev MODIFIER : checks then that _owner has already signed up to the T2G app and is not banned. Otherwise revert HoneyInvalidOwner error
     /// @dev MODIFIER : checks then that _owner is the token owner. Otherwise revert HoneyInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to an already existing Honey token. Otherwise revert HoneyInvalidTokenId error
     /// @dev MODIFIER : checks then that tokenId refers to one Draft Honey token. Otherwise revert HoneyInvalidStatus error
     /// @dev YTBD : once cheks are OK, then sets the status of Honey Token to Active.

    function approveHoney( uint256 _tokenId, address _owner ) 
        external isT2GOwner isHoney(_tokenId) isDraft(_tokenId) {
        
        if (!LibOwners._isAllowed(_owner, T2GTypes.R_GIVES)) revert HoneyInvalidOwner(_owner);
        if (_owner != LibERC721._ownerOf(_tokenId)) revert HoneyInvalidOwner(_owner);

        // We transfer the amount represented by the Honey Token to the HoneyFacet@ to endorse it

        EUR _eurSC = EUR(LibOwners.syndication().scAddress);
        address _honey = get_T2G_HoneyFacet();

        emit HoneyTrace( address(this), _honey, address(_eurSC), _tokenId, _owner );
        
        try  _eurSC.transfer( _honey, LibERC721.layout().token[_tokenId].value ) returns (bool) {
            LibERC721.layout().token[_tokenId].state = LibERC721.Statusoftoken.validated;
            } catch Error(string memory reason) {
                // catch failing revert() and require()
                revert HoneyFailedTransfer( _tokenId, _owner, _honey, reason );
            } catch (bytes memory reason) {
                // catch failing assert()
                revert HoneyFailedTransfer( _tokenId, _owner, _honey, string(reason) );
                }
        
        //if (_balance < _value) revert HoneyInvalidBalance( _to, _balance);
        }

     /// @notice Transfers the amount of native coin related to an active Honey Token to the contract pool.
     /// @notice Only the T2G Owner can run this function on behalf of the owner of the token, 
     /// @notice Both TokenId and Owner address are to be given as inputs to prevent any undesired or malicious action.
     /// @notice Emits a {HoneyAmountTransfer} event when successful
     /// @param _tokenId the Id given to the Honey Token
     /// @param _owner address of the owner of the token. 
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert HoneyInvalidSender error
     /// @dev MODIFIER : checks then that _owner is the token owner. Otherwise revert HoneyInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to an already existing Honey token. Otherwise revert HoneyInvalidTokenId error
     /// @dev MODIFIER : checks then that tokenId refers to one Active Honey token. Otherwise revert HoneyInvalidStatus error
     /// @dev Once cheks are OK, then send a transfer call from this contract to the T2G_PoolFacet contract

    function transferToPool(uint256 _tokenId, address _owner) 
        external isT2GOwner isHoney(_tokenId) isValidated(_tokenId) isRootValid {
        // On récupère le montant de don associé Token
        LibERC721.TokenStruct memory data = LibERC721._tokenCommonFeatures(_tokenId);
        address _root = T2G_PoolFacet(LibERC721.layout().root).get_T2G_PoolFacet();
        EUR _eurSC = EUR(LibOwners.syndication().scAddress);
        address _honey = get_T2G_HoneyFacet();

        if (!LibOwners._isAllowed(_owner, T2GTypes.R_GIVES)) revert HoneyInvalidOwner(_owner);
        if (_owner != LibERC721._ownerOf(_tokenId)) revert HoneyInvalidOwner(_owner);

        if (_root == address(0)) revert HoneyInvalidContractAddress("PoolFacet");
        // On authorise le T2G_PoolFacet contract à agir sur le Token de Owner
        LibERC721._approve( _root, _tokenId, _owner);
        // POC (Only) Check that unit is T2GSC otherwise revert
        // T2G (YTBD) check unit related to value and turn it into T2GSC is possible
        if (T2GTypes.CoinUnit(LibERC721.layout().fund[_tokenId].valueUnit) != T2GTypes.CoinUnit.T2GSC) 
            revert HoneyInvalidValueUnit(_tokenId, T2GTypes.CoinUnit(LibERC721.layout().fund[_tokenId].valueUnit));

        try  _eurSC.transferFrom( _honey, _root, data.value ) returns (bool) {
            LibERC721.layout().token[_tokenId].state = LibERC721.Statusoftoken.active;
            emit HoneyAmountTransfer( _tokenId, _root, data.value );
            } catch Error(string memory reason) {
                // catch failing revert() and require()
                revert HoneyFailedTransfer( _tokenId, _owner, _honey, reason );
            } catch (bytes memory reason) {
                // catch failing assert()
                revert HoneyFailedTransfer( _tokenId, _owner, _honey, string(reason) );
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
        if (LibERC721.layout().token[_tokenId].state > LibERC721.Statusoftoken.validated) revert HoneyInvalidStatus(_tokenId);

        //LibERC721._burn(_tokenId);
        LibERC721.layout().token[_tokenId].state = LibERC721.Statusoftoken.canceled;
        }

}