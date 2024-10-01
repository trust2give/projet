// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {LibERC721} from "../libraries/LibERC721.sol";

contract MintFacet {

    function beacon_MintFacet() public pure returns (string memory) { return "MintFacet::1.0.0"; }

    function mint(address _to, uint256 _tokenId) external payable {
        LibERC721._mint(_to, _tokenId);
    }

    function balanceOf() external view returns (uint) {
        return address(this).balance;        
    }

    function safeMint(address _to, uint256 _tokenId) external payable {
        LibERC721._mint(_to, _tokenId);
    }

    function burn(uint256 _tokenId) external {
        LibERC721._burn(_tokenId);
    }

}