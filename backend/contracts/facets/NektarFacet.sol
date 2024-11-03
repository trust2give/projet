// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {LibERC721} from "../libraries/LibERC721.sol";
//import {ERC721Errors} from "../libraries/Errors.sol";
import {T2GTypes} from "../libraries/Types.sol";
import { LibDiamond } from "../libraries/LibDiamond.sol";


/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.fr>, Github: @fdervillez
* T2G_NektarFacet
*
* Implementation of a Trust2Give Nektar Reward Token.
/******************************************************************************/

/// @title Contract that manages the Nektar Token for Trust2Give dApp

contract T2G_NektarFacet {

    error NektarInvalidTokenId(uint256 tokenId);
    error NektarInvalidOwner(address owner);
    error NektarInvalidSender(address sender);
    error NektarInvalidAmount(address sender);
    error NektarInvalidStatus(uint256 tokenId);
    error NektarInvalidContractAddress();

    event NektarSetWhiteList(uint256 tokenId, T2GTypes.BusinessSector _sector);
    event NektarSetBlackList(uint256 tokenId, T2GTypes.BusinessSector _sector);
    event NektarActive( uint256 tokenId);
    event NektarAmountTransfer( uint256 tokenId);
    event NektarReview( address owner );
    event NektarRootAddressSet( address root );

    modifier isT2GOwner {
        if (msg.sender != LibDiamond.contractOwner()) revert NektarInvalidSender(msg.sender);
        _;
        }

    modifier isT2GOwnerOrNektarOwner(uint256 _tokenId) {
        if (msg.sender != LibDiamond.contractOwner() && msg.sender != LibERC721._ownerOf(_tokenId)) {
                revert NektarInvalidSender(msg.sender);
                }
        _;
        }

    modifier isNektarOwner(uint256 _tokenId, address _caller) {
        if (_caller != LibERC721._ownerOf(_tokenId)) {
                revert NektarInvalidOwner(_caller);
                }
        _;
        }

    modifier isNektar(uint256 _tokenId) {
        if (!LibERC721._tokenOfType( _tokenId, LibERC721.Typeoftoken.Nektar )) {
            revert NektarInvalidTokenId(_tokenId);
            }
        _;
        }

    modifier isDraft(uint256 _tokenId) {
        if (LibERC721.layout().token[_tokenId].state != LibERC721.Statusoftoken.draft) {
            revert NektarInvalidStatus(_tokenId);
            }
        _;
        }

    modifier isActive(uint256 _tokenId) {
        if (LibERC721.layout().token[_tokenId].state != LibERC721.Statusoftoken.active) {
            revert NektarInvalidStatus(_tokenId);
            }
        _;
        }

    constructor( address _root ) {
        if (_root == address(0)) revert NektarInvalidContractAddress();
        else if (LibERC721.layout().root == address(0)) {
            LibERC721.layout().root = _root;
            emit NektarRootAddressSet( _root );
            }
        else if (_root != LibERC721.layout().root) revert NektarInvalidContractAddress();
        }

     /// @notice checks that the deployed contract is alive and returns its version
     /// @dev the returned text is to be updated whenever a change in the contract is made and new deployment is carried out
     /// @return string that recalls the contact name + its current deployed version : "contractname::version"

    function beacon_NektarFacet() public pure returns (string memory) { return "T2G_NektarFacet::1.0.1"; }

     /// @notice returns the address of the the contract
     /// @dev All Facet in T2G application must implement this function of type "get_<Contract Name>()
     /// @return Address of the current instance of contract
    function get_T2G_NektarFacet() public view returns (address) {
        return address(this);        
        }

     /// @notice returns the features of a specific Nektar, given its tokenId 
     /// @param _tokenId token Id
     /// @dev MODIFIER : checks first that msg.sender is either the T2G owner or the token owner. Otherwise revert NektarInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to a Nektar and no other type of token. Otherwise revert NektarInvalidTokenId error
     /// @dev IMPORTANT : no checks is done if tokenId is null.
     /// @return tuple (type of token, status of token, amount tied to token)

    function nektar(uint256 _tokenId) 
        external isT2GOwnerOrNektarOwner(_tokenId) isNektar(_tokenId) view returns (LibERC721.Typeoftoken , LibERC721.Statusoftoken, uint256) {
        LibERC721.TokenStruct memory data = LibERC721._tokenCommonFeatures(_tokenId);
        return (data.token, data.state, data.value);
        }

     /// @notice Mints a new Nektar Token for a specific owner address. Emits a {Transfer} event when successful
     /// @notice Minting Nektar with no msg.value or zero is not permitted. Value represent the amoung in native coin (WEI) that is given by the owner to T2G apps
     /// @notice The newly created Nektar Token is set with a Draft status and will remain so until the white or black list have been sets
     /// @notice YTBD: and Nektar token has been approved by the T2G owner through the function approveNektar. From this moment onward, the Nektar turns active
     /// @notice YTBD: Until approval, the Nektar Token can be burned and canceled.
     /// @notice YTBD: Once status is active, the Nektar Token can no longer be burned.T2G Owner can transfer the amount from This contract to the pool.
     /// @param _to address of the new Nektar token owner
     /// @param _tokenId the Id gien to the new Nektar Token
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert NektarInvalidSender error
     /// @dev MODIFIER : checks second that msg.value > 0. Otherwise revert NektarInvalidAmount error
     /// @dev YTBD : checks third that future owner of new token has already signed up to the T2G app and is known. Otherwise revert NektarInvalidOwner error
     /// @dev checks then that tokenId does not refer to no already existing token (of any type). Otherwise revert NektarInvalidTokenId error
     /// @dev once cheks are OK and Nektar token minted, then sets the approval flags that allow either the owner or the T2G owner to manage the token

    function mintNektar(address _to, uint256 _tokenId, uint256 _amount) external isT2GOwner {
        LibERC721.TokenStruct memory _data;
        
        _data.token = LibERC721.Typeoftoken.Nektar;
        _data.state = LibERC721.Statusoftoken.draft;
        _data.value = _amount;

        LibERC721._safeMint(_to, _tokenId, abi.encode(_data));
        LibERC721._approve(msg.sender, _tokenId, _to);
        LibERC721._setApprovalForAll(_to, msg.sender, true);
        }

     /// @notice Approves an Nektar Token which is in draft status. From this moment onward, the Nektar turns active
     /// @notice Only the T2G Owner can run this function on behalf of the owner of the token, 
     /// @notice Both TokenId and Owner address are to be given as inputs to prevent any undesired or malicious action.
     /// @notice Emits a {NektarActive} event when successful
     /// @notice YTBD: Until approval, the Nektar Token can be burned and canceled.
     /// @notice YTBD: Once status is active, the Nektar Token can no longer be burned.T2G Owner can transfer the amount from This contract to the pool.
     /// @param _tokenId the Id given to the Nektar Token
     /// @param _owner address of the owner of the token. 
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert NektarInvalidSender error
     /// @dev MODIFIER : checks then that _owner is the token owner. Otherwise revert NektarInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to an already existing Nektar token. Otherwise revert NektarInvalidTokenId error
     /// @dev MODIFIER : checks then that tokenId refers to one Draft Nektar token. Otherwise revert NektarInvalidStatus error
     /// @dev YTBD : once cheks are OK, then sets the status of Nektar Token to Active.

    function approveNektar( uint256 _tokenId, address _owner ) 
        external isT2GOwner isNektarOwner(_tokenId, _owner) isNektar(_tokenId) isDraft(_tokenId) {
        LibERC721.layout().token[_tokenId].state = LibERC721.Statusoftoken.active;
        }

     /// @notice Burns / Cancels a draft Nektar Token. For security reasons. 
     /// @notice Only the T2G Owner can run this function on behalf of the owner of the token, 
     /// @notice Both TokenId and Owner address are to be given as inputs to prevent any undesired or malicious action.
     /// @notice Emits a {NektarBurn} event when successful
     /// @param _tokenId the Id given to the Nektar Token
     /// @param _owner address of the owner of the token. 
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert NektarInvalidSender error
     /// @dev MODIFIER : checks then that _owner is the token owner. Otherwise revert NektarInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to an already existing Nektar token. Otherwise revert NektarInvalidTokenId error
     /// @dev MODIFIER : checks then that tokenId refers to one draft Nektar token. Otherwise revert NektarInvalidStatus error
     /// @dev YTBD : once cheks are OK, it turns the status to canceled
     /// @dev YTDB : IMPORTANT Check how to cope with "burn" in the sense of ERC721 and canceled as per T2G. Burning does not clear/erase the token
     /// @dev from the pool of tokens but rather freezes it to the Canceled state, for later tracability purposes.

    function burnNektar(uint256 _tokenId, address _owner) 
        external isT2GOwner isNektarOwner(_tokenId, _owner) isNektar(_tokenId) isDraft(_tokenId) {
        if (LibERC721._tokenOfType( _tokenId, LibERC721.Typeoftoken.Nektar )) {
            LibERC721._burn(_tokenId);
            }
        revert NektarInvalidTokenId(_tokenId);
        }

}