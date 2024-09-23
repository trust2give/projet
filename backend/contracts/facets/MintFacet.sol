// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {LibERC721} from "../libraries/LibERC721.sol";

contract MintFacet {

    function mint(address _to, uint256 _tokenId) external {
        LibERC721._mint(_to, _tokenId);
    }

    function safeMint(address _to, uint256 _tokenId) external {
        LibERC721._mint(_to, _tokenId);
    }

    function burn(uint256 _tokenId) external {
        LibERC721._burn(_tokenId);
    }

}