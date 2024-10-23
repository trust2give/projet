// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {LibERC721} from "../libraries/LibERC721.sol";
//import {ERC721Errors} from "../libraries/Errors.sol";
import {T2GTypes} from "../libraries/Types.sol";
import { LibDiamond } from "../libraries/LibDiamond.sol";


/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.fr>, Github: @fdervillez
* T2G_PollenFacet
*
* Implementation of a Trust2Give Pollen Utility Token.
/******************************************************************************/

/// @title Contract that manages the Pollen Token for Trust2Give dApp

contract T2G_PollenFacet {

    address private diamond;

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

    modifier isPollenOwner(uint256 _tokenId, address _caller) {
        if (_caller != LibERC721._ownerOf(_tokenId)) {
                revert PollenInvalidOwner(_caller);
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
        return address(this);        
        }

     /// @notice returns the amount currently remaining on the contract balance in native coin
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert PollenInvalidSender error
     /// @dev the native coin is either ETH, POL or any other EVM compliant blockchain where the contract is deployed in
     /// @dev the contract is inside an ERC2535 structure, so the value refers to this contract and not the diamond root
     /// @return uint amount of native token in WEI or equivalent

    function balanceOfPollenFacet() external isT2GOwner view returns (uint) {
        return address(this).balance;        
        }

     /// @notice returns the features of a specific Pollen, given its tokenId 
     /// @param _tokenId token Id
     /// @dev MODIFIER : checks first that msg.sender is either the T2G owner or the token owner. Otherwise revert PollenInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to a Pollen and no other type of token. Otherwise revert PollenInvalidTokenId error
     /// @dev IMPORTANT : no checks is done if tokenId is null.
     /// @return tuple (type of token, status of token, amount tied to token)

    function pollen(uint256 _tokenId) 
        external isT2GOwnerOrPollenOwner(_tokenId) isPollen(_tokenId) view returns (LibERC721.Typeoftoken , LibERC721.Statusoftoken, uint256) {
        LibERC721.TokenStruct memory data = LibERC721._tokenFeatures(_tokenId);
        return (data.token, data.state, data.value);
        }

     /// @notice Mints a new Pollen Token for a specific owner address. Emits a {Transfer} event when successful
     /// @notice This is a payable function that requires msg.value represents the amount of gift that is related to the Pollen Token
     /// @notice Minting Pollen with no msg.value or zero is not permitted. Value represent the amoung in native coin (WEI) that is given by the owner to T2G apps
     /// @notice The newly created Pollen Token is set with a Draft status and will remain so until the white or black list have been sets
     /// @notice YTBD: and Pollen token has been approved by the T2G owner through the function approvePollen. From this moment onward, the Pollen turns active
     /// @notice YTBD: Until approval, the Pollen Token can be burned and canceled.
     /// @notice YTBD: Once status is active, the Pollen Token can no longer be burned.T2G Owner can transfer the amount from This contract to the pool.
     /// @param _to address of the new Pollen token owner
     /// @param _tokenId the Id gien to the new Pollen Token
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert PollenInvalidSender error
     /// @dev MODIFIER : checks second that msg.value > 0. Otherwise revert PollenInvalidAmount error
     /// @dev YTBD : checks third that future owner of new token has already signed up to the T2G app and is known. Otherwise revert PollenInvalidOwner error
     /// @dev checks then that tokenId does not refer to no already existing token (of any type). Otherwise revert PollenInvalidTokenId error
     /// @dev once cheks are OK and Pollen token minted, then sets the approval flags that allow either the owner or the T2G owner to manage the token

    function mintPollen(address _to, uint256 _tokenId, uint256 _quantity) external isT2GOwner {
        LibERC721.TokenStruct memory _data;
        
        _data.token = LibERC721.Typeoftoken.Pollen;
        _data.state = LibERC721.Statusoftoken.draft;
        _data.value = _quantity;

        LibERC721._safeMint(_to, _tokenId, abi.encode(_data));
        LibERC721._approve(msg.sender, _tokenId, _to);
        LibERC721._setApprovalForAll(_to, msg.sender, true);
        }

     /// @notice Approves an Pollen Token which is in draft status. From this moment onward, the Pollen turns active
     /// @notice Only the T2G Owner can run this function on behalf of the owner of the token, 
     /// @notice Both TokenId and Owner address are to be given as inputs to prevent any undesired or malicious action.
     /// @notice Emits a {PollenActive} event when successful
     /// @notice YTBD: Until approval, the Pollen Token can be burned and canceled.
     /// @notice YTBD: Once status is active, the Pollen Token can no longer be burned.T2G Owner can transfer the amount from This contract to the pool.
     /// @param _tokenId the Id given to the Pollen Token
     /// @param _owner address of the owner of the token. 
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert PollenInvalidSender error
     /// @dev MODIFIER : checks then that _owner is the token owner. Otherwise revert PollenInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to an already existing Pollen token. Otherwise revert PollenInvalidTokenId error
     /// @dev MODIFIER : checks then that tokenId refers to one Draft Pollen token. Otherwise revert PollenInvalidStatus error
     /// @dev YTBD : once cheks are OK, then sets the status of Pollen Token to Active.

    function approvePollen( uint256 _tokenId, address _owner ) 
        external isT2GOwner isPollenOwner(_tokenId, _owner) isPollen(_tokenId) isDraft(_tokenId) {
        LibERC721.layout().token[_tokenId].state = LibERC721.Statusoftoken.active;
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
        external isT2GOwner isPollenOwner(_tokenId, _owner) isPollen(_tokenId) isDraft(_tokenId) {
        if (LibERC721._tokenOfType( _tokenId, LibERC721.Typeoftoken.Pollen )) {
            LibERC721._burn(_tokenId);
            }
        revert PollenInvalidTokenId(_tokenId);
        }

}