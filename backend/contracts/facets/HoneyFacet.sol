// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {LibERC721} from "../libraries/LibERC721.sol";
import {ERC721Errors} from "../libraries/Errors.sol";
import {T2GTypes} from "../libraries/Types.sol";
import { LibDiamond } from "../libraries/LibDiamond.sol";
import { ERC721Facet } from "./ERC721Facet.sol";
import { T2G_PoolFacet } from "./PoolFacet.sol";
import {T2GTypes} from "../libraries/Types.sol";


/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.fr>, Github: @fdervillez
* T2G_HoneyFacet
*
* Implementation of a Trust2Give Honey Utility Token.
/******************************************************************************/

/// @title Contract that manages the Honey Token for Trust2Give dApp

contract T2G_HoneyFacet {

    address private diamond;

    error HoneyInvalidTokenId(uint256 tokenId);
    error HoneyInvalidOwner(address owner);
    error HoneyInvalidSender(address sender);
    error HoneyInvalidAmount(address sender);
    error HoneyInvalidContractAddress();
    error HoneyInvalidStatus(uint256 tokenId);
    error HoneyInvalidValueUnit(uint256 tokenId, T2GTypes.CoinUnit unit);

    event HoneySetWhiteList(uint256 tokenId, T2GTypes.BusinessSector _sector);
    event HoneySetBlackList(uint256 tokenId, T2GTypes.BusinessSector _sector);
    event HoneyActive( uint256 tokenId);
    event HoneyAmountTransfer( uint256 tokenId);
    event HoneyReview( address owner );

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

    modifier isHoneyOwner(uint256 _tokenId, address _caller) {
        if (_caller != LibERC721._ownerOf(_tokenId)) {
                revert HoneyInvalidOwner(_caller);
                }
        _;
        }

    modifier isFee {
        if (msg.value == 0) revert HoneyInvalidAmount(msg.sender);
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

    modifier isActive(uint256 _tokenId) {
        if (LibERC721.layout().token[_tokenId].state != LibERC721.Statusoftoken.active) {
            revert HoneyInvalidStatus(_tokenId);
            }
        _;
        }

    constructor( address _root ) {
        if (_root == address(0)) revert HoneyInvalidContractAddress();
        diamond = _root;
        }

     /// @notice checks that the deployed contract is alive and returns its version
     /// @dev the returned text is to be updated whenever a change in the contract is made and new deployment is carried out
     /// @return string that recalls the contact name + its current deployed version : "contractname::version"

    function beacon_HoneyFacet() public pure returns (string memory) { return "T2G_HoneyFacet::1.0.9"; }

     /// @notice returns the address of the the contract
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert HoneyInvalidSender error
     /// @dev All Facet in T2G application must implement this function of type "get_<Contract Name>()
     /// @return Address of the current instance of contract
    function get_T2G_HoneyFacet() public isT2GOwner view returns (address) {
        return address(this);        
        }

     /// @notice returns the amount currently remaining on the contract balance in native coin
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert HoneyInvalidSender error
     /// @dev the native coin is either ETH, POL or any other EVM compliant blockchain where the contract is deployed in
     /// @dev the contract is inside an ERC2535 structure, so the value refers to this contract and not the diamond root
     /// @return uint amount of native token in WEI or equivalent

    function balanceOf() external isT2GOwner view returns (uint) {
        return address(this).balance;        
        }

     /// @notice returns the features of a specific Honey, given its tokenId 
     /// @param _tokenId token Id
     /// @dev MODIFIER : checks first that msg.sender is either the T2G owner or the token owner. Otherwise revert HoneyInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to a Honey and no other type of token. Otherwise revert HoneyInvalidTokenId error
     /// @dev IMPORTANT : no checks is done if tokenId is null.
     /// @return tuple (type of token, status of token, amount tied to token)

    function honey(uint256 _tokenId) 
        external isT2GOwnerOrHoneyOwner(_tokenId) isHoney(_tokenId) view returns (LibERC721.Typeoftoken , LibERC721.Statusoftoken, string memory, uint256, uint8, uint8) {
        LibERC721.TokenStruct memory data = LibERC721._tokenFeatures(_tokenId);
        return (data.token, data.state, data.date, data.value, data.valueUnit, data.rate);
        }

     /// @notice Mints a new Honey Token for a specific owner address. Emits a {Transfer} event when successful
     /// @notice This is a payable function that requires msg.value represents the amount of gift that is related to the Honey Token
     /// @notice Minting Honey with no msg.value or zero is not permitted. Value represent the amoung in native coin (GWEI) that is given by the owner to T2G apps
     /// @notice The newly created Honey Token is set with a Draft status and will remain so until the white or black list have been sets
     /// @notice YTBD: and Honey token has been approved by the T2G owner through the function approveHoney. From this moment onward, the Honey turns active
     /// @notice YTBD: Until approval, the Honey Token can be burned and canceled.
     /// @notice YTBD: Once status is active, the Honey Token can no longer be burned.T2G Owner can transfer the amount from This contract to the pool.
     /// @param _to address of the new Honey token owner
     /// @param _tokenId the Id gien to the new Honey Token
     /// @param _unit the unit of the amount given
     /// @param _rate the percentage of the amount dedicated to gift
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert HoneyInvalidSender error
     /// @dev MODIFIER : checks second that msg.value > 0. Otherwise revert HoneyInvalidAmount error
     /// @dev YTBD : checks third that future owner of new token has already signed up to the T2G app and is known. Otherwise revert HoneyInvalidOwner error
     /// @dev checks then that tokenId does not refer to no already existing token (of any type). Otherwise revert HoneyInvalidTokenId error
     /// @dev once cheks are OK and Honey token minted, then sets the approval flags that allow either the owner or the T2G owner to manage the token

    function mintHoney(address _to, uint256 _tokenId, T2GTypes.CoinUnit _unit, uint8 _rate) external isT2GOwner isFee payable {
        LibERC721.TokenStruct memory _data;
        
        _data.token = LibERC721.Typeoftoken.Honey;
        _data.state = LibERC721.Statusoftoken.draft;
        _data.value = msg.value;
        _data.valueUnit = uint8(_unit);
        _data.rate = _rate;
        _data.date = "Now";

        LibERC721._safeMint(_to, _tokenId, abi.encode(_data));
        LibERC721._approve(msg.sender, _tokenId, _to);
        LibERC721._setApprovalForAll(_to, msg.sender, true);
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
     /// @notice Emits a {HoneyActive} event when successful
     /// @notice YTBD: Until approval, the Honey Token can be burned and canceled.
     /// @notice YTBD: Once status is active, the Honey Token can no longer be burned.T2G Owner can transfer the value from This contract to the pool.
     /// @param _tokenId the Id given to the Honey Token
     /// @param _owner address of the owner of the token. 
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert HoneyInvalidSender error
     /// @dev MODIFIER : checks then that _owner is the token owner. Otherwise revert HoneyInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to an already existing Honey token. Otherwise revert HoneyInvalidTokenId error
     /// @dev MODIFIER : checks then that tokenId refers to one Draft Honey token. Otherwise revert HoneyInvalidStatus error
     /// @dev YTBD : once cheks are OK, then sets the status of Honey Token to Active.

    function approveHoney( uint256 _tokenId, address _owner ) 
        external isT2GOwner isHoneyOwner(_tokenId, _owner) isHoney(_tokenId) isDraft(_tokenId) {
        LibERC721.layout().token[_tokenId].state = LibERC721.Statusoftoken.active;
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
        external isT2GOwner isHoneyOwner(_tokenId, _owner) isHoney(_tokenId) isActive(_tokenId) payable {
        // On récupère le montant de don associé Token
        LibERC721.TokenStruct memory data = LibERC721._tokenFeatures(_tokenId);

        // On authorise le T2G_PoolFacet contract à agir sur le Token de Owner
        LibERC721._approve( T2G_PoolFacet(diamond).get_T2G_PoolFacet(), _tokenId, _owner);
        // POC (Only) Check that unit is GWEI otherwise revert
        // T2G (YTBD) check unit related to value and turn it into GWEI is possible
        if (T2GTypes.CoinUnit(data.valueUnit) != T2GTypes.CoinUnit.GWEI) revert HoneyInvalidValueUnit(_tokenId, T2GTypes.CoinUnit(data.valueUnit));
        T2G_PoolFacet(T2G_PoolFacet(diamond).get_T2G_PoolFacet()).poolTransfertFrom(data.value);
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
        external isT2GOwner isHoneyOwner(_tokenId, _owner) isHoney(_tokenId) isDraft(_tokenId) {
        if (LibERC721._tokenOfType( _tokenId, LibERC721.Typeoftoken.Honey )) {
            LibERC721._burn(_tokenId);
            }
        revert HoneyInvalidTokenId(_tokenId);
        }

}