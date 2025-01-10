// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {ERC721Errors} from "./Errors.sol";
import {ERC721Events} from "./Events.sol";
import {T2GTypes} from "./Types.sol";
import {LibERC721} from "./LibERC721.sol";

library LibPollens {

    event PollenParamsTrace(uint256 _amound, uint8 _unit, uint8 _size);
    event PollenCreated( address owner, uint256 tokenId, uint256 value, uint8 unit );

    error PollenInvalidStatus(uint256 tokenId);

     /// @notice returns the features of a specific rwa, given its rwaId 
     /// @param _rwaId token Id
     /// @dev MODIFIER : checks first that msg.sender is either the T2G owner or the token owner. Otherwise revert PollenInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to a Pollen and no other type of token. Otherwise revert PollenInvalidTokenId error
     /// @return TokenRWASpecific object

    function _rwa(bytes32 _rwaId) internal view returns ( LibERC721.TokenRWASpecific storage ) {
        return LibERC721._tokenRwaFeatures(_rwaId); 
        }

    function _setParams (uint256 _value, T2GTypes.sizeUnit _size, T2GTypes.CoinUnit _unit) internal {
        LibERC721.layout().idFeatures[uint256(LibERC721.Typeoftoken.Pollen)].value = _value;
        LibERC721.layout().idFeatures[uint256(LibERC721.Typeoftoken.Pollen)].size = _size;
        LibERC721.layout().idFeatures[uint256(LibERC721.Typeoftoken.Pollen)].unit = _unit;
        }

    function _getParams () internal view returns (uint256 _value, T2GTypes.sizeUnit _size, T2GTypes.CoinUnit _unit) {
        _value = LibERC721.layout().idFeatures[uint256(LibERC721.Typeoftoken.Pollen)].value;
        _size = LibERC721.layout().idFeatures[uint256(LibERC721.Typeoftoken.Pollen)].size;
        _unit = LibERC721.layout().idFeatures[uint256(LibERC721.Typeoftoken.Pollen)].unit;
        }

     /// @notice Mints one Pollen Token for a specific owner address.
     /// @notice A Pollen as a fixed-quantity of GHG Gain / unit which is retrieved / updated by stakeholders
     /// @notice Emits a series of {Transfer} / {approve} events when successful
     /// @notice Emits a final PollenCreated event with the TokenId of the new Pollen
     /// @notice The newly created Pollen Token is set with a Draft status and will remain so all features have been sets & all details provided
     /// @notice Until certification, the Pollen Token can be canceled.
     /// @notice Once status is certified, the Pollen Token can no longer be canceled.
     /// @param _to address of the new Pollen token owner
     /// @param _entityId bytes32 Id of entity bound to the Pollen
     /// @param _rwaId bytes32 Id of rwa bound to the Pollen
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert PollenInvalidSender error
     /// @dev Checks then that future owner of new token has already signed up to the T2G app and is known. Otherwise revert PollenInvalidOwner error
     /// @dev Checks then that tokenId does not refer to no already existing token (of any type) by selecting the first non used Id in the list
     /// @dev once cheks are OK and Pollen token minted, then sets the approval flags that allow either the owner or the T2G owner to manage the token

    function _mint(address _to, bytes32 _entityId, bytes32 _rwaId ) internal {
        LibERC721.TokenStruct memory _data;

        _data.token = LibERC721.Typeoftoken.Pollen;
        _data.state = LibERC721.Statusoftoken.draft;
        _data.created = block.timestamp;
        _data.updated = _data.created;

        (_data.value, _data.size, ) = _getParams();
        
        _data.unit = T2GTypes.CoinUnit.NONE;
        _data.owner = _entityId;
        _data.asset = _rwaId;

        // We need to get the next _TokenId value available
        uint256 _tokenId = LibERC721.layout().allTokens.length;

        LibERC721._safeMint(_to, _tokenId, abi.encode(_data));
        LibERC721._approve(msg.sender, _tokenId, _to);
        LibERC721._setApprovalForAll(_to, msg.sender, true);

        LibERC721.layout().rwa[_rwaId].state = LibERC721.Statusoftoken.active;
        LibERC721.layout().entity[_entityId].state = LibERC721.Statusoftoken.active;
        
        emit PollenCreated( _to, _tokenId, _data.value, uint8(_data.size)); 
        }

     /* */
    function isStateAtomic( bytes32 _rwaId, LibERC721.Statusoftoken _state ) internal view returns (uint256[] memory) {
        uint256[] memory _pollens = LibERC721._getTokensWithAsset(_rwaId, LibERC721.Typeoftoken.Pollen, LibERC721.Statusoftoken.None);
        for (uint256 i = 0; i < _pollens.length; i++) {
            if (LibERC721.layout().token[_pollens[i]].state != _state) revert PollenInvalidStatus(_pollens[i]);
            }
        return _pollens;
        }

    }