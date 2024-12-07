// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {ERC721Errors} from "./Errors.sol";
import {ERC721Events} from "./Events.sol";
import {T2GTypes} from "./Types.sol";
import {LibERC721} from "./LibERC721.sol";

library LibEntities {

     /// @notice returns the features of a specific entity, given its Id 
     /// @param _entityId token Id
     /// @dev MODIFIER : checks first that msg.sender is either the T2G owner or the token owner. Otherwise revert PollenInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to a Pollen and no other type of token. Otherwise revert PollenInvalidTokenId error
     /// @return TokenRWASpecific object

    function _entity(bytes32 _entityId) internal view returns ( LibERC721.TokenEntitySpecific storage ) {
        return LibERC721.layout().entity[_entityId];
        }

}