// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {LibERC721} from "../libraries/LibERC721.sol";

contract HoneyFacet {

    error HoneyInvalidTokenId(uint256 tokenId);

    function beacon_HoneyFacet() public pure returns (string memory) { return "HoneyFacet::1.0.1"; }

    function balanceOf() external view returns (uint) {
        return address(this).balance;        
    }

    function honey(uint256 _tokenId) external view returns (LibERC721.TokenStruct) {
        LibERC721.TokenStruct data = LibERC721._tokenFeatures(_tokenId);
        if (data.token == LibERC721.Typeoftoken.Honey) return data;
        revert HoneyInvalidTokenId(_tokenId);
        }

    function mintHoneyMint(address _to, uint256 _tokenId) external payable {
        LibERC721.TokenStruct memory _data;
        _data.name = "Honey";
        _data.symbol = "HNY";
        _data.token = LibERC721.Statusoftoken.draft;
        _data.amount = msg.value;

        LibERC721._safeMint(_to, _tokenId, abi.encode(_data));
    }

    function burn(uint256 _tokenId) external {
        LibERC721._burn(_tokenId);
    }

}