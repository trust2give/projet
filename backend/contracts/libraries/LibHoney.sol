// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {ERC721Errors} from "./Errors.sol";
import {ERC721Events} from "./Events.sol";
import {T2GTypes} from "./Types.sol";
import {LibERC721} from "./LibERC721.sol";

library LibHoney {

    event HoneyCreated( address owner, uint256 tokenId );
    error HoneyInvalidStatus(uint256 tokenId);

     /// @notice returns the features of a specific honey, given its Id 
     /// @param _fundId token Id
     /// @dev MODIFIER : checks first that msg.sender is either the T2G owner or the token owner. Otherwise revert PollenInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to a Pollen and no other type of token. Otherwise revert PollenInvalidTokenId error
     /// @return TokenFundSpecific object

    function _fund(bytes32 _fundId) internal view returns ( LibERC721.TokenFundSpecific memory ) {
        LibERC721.TokenFundSpecific memory _result = LibERC721._tokenFundFeatures(_fundId);
        return _result;
        }

    function _setParams (uint256 _value, T2GTypes.sizeUnit _size, T2GTypes.CoinUnit _unit) internal {
        LibERC721.layout().idFeatures[uint256(LibERC721.Typeoftoken.Honey)].value = _value;
        LibERC721.layout().idFeatures[uint256(LibERC721.Typeoftoken.Honey)].size = _size;
        LibERC721.layout().idFeatures[uint256(LibERC721.Typeoftoken.Honey)].unit = _unit;
        }

    function _getParams () internal view returns (uint256 _value, T2GTypes.sizeUnit _size, T2GTypes.CoinUnit _unit) {
        _value = LibERC721.layout().idFeatures[uint256(LibERC721.Typeoftoken.Honey)].value;
        _size = LibERC721.layout().idFeatures[uint256(LibERC721.Typeoftoken.Honey)].size;
        _unit = LibERC721.layout().idFeatures[uint256(LibERC721.Typeoftoken.Honey)].unit;
        }

     /// @notice Mints one Honey Token for a specific owner address.
     /// @param _to address of the new Pollen token owner
     /// @param _fundId bytes32 Id of rwa bound to the Pollen
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert PollenInvalidSender error
     /// @dev Checks then that future owner of new token has already signed up to the T2G app and is known. Otherwise revert PollenInvalidOwner error
     /// @dev Checks then that tokenId does not refer to no already existing token (of any type) by selecting the first non used Id in the list
     /// @dev once cheks are OK and Pollen token minted, then sets the approval flags that allow either the owner or the T2G owner to manage the token

    function _mint(address _to, bytes32 _entity,  bytes32 _fundId ) internal returns (uint256) {
        LibERC721.TokenStruct memory _data;

        _data.token = LibERC721.Typeoftoken.Honey;
        _data.state = LibERC721.Statusoftoken.draft;
        _data.created = block.timestamp;
        _data.updated = _data.created;

        LibERC721.TokenFundSpecific memory fund = _fund( _fundId );

        _data.value = fund.value;
        _data.unit = fund.unit;       
        _data.size = T2GTypes.sizeUnit.NONE;
        _data.owner = _entity;
        _data.asset = _fundId;

        // We need to get the next _TokenId value available
        uint256 _tokenId = LibERC721.layout().allTokens.length;

        LibERC721._safeMint(_to, _tokenId, abi.encode(_data));
        LibERC721._approve(msg.sender, _tokenId, _to);
        LibERC721._setApprovalForAll(_to, msg.sender, true);

        emit HoneyCreated( _to, _tokenId );
        return _tokenId;
        }

     /* */
    function isStateAtomic( bytes32 _fundId, LibERC721.Statusoftoken _state ) internal view returns (uint256[] memory) {
        uint256[] memory _honey = LibERC721._getTokensWithAsset(_fundId, LibERC721.Typeoftoken.Honey, LibERC721.Statusoftoken.None);
        for (uint256 i = 0; i < _honey.length; i++) {
            if (LibERC721.layout().token[_honey[i]].state != _state) revert HoneyInvalidStatus(_honey[i]);
            }
        return _honey;
        }

}