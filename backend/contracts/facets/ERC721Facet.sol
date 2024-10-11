// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
//import {IERC721Metadata} from "../interfaces/IERC721Metadata.sol";
import {IERC721Enumerable} from "../interfaces/IERC721Enumerable.sol";
import {LibERC721} from "../libraries/LibERC721.sol";
import {ERC721Errors} from "../libraries/Errors.sol";

contract ERC721Facet is IERC721Enumerable {
    using Strings for uint;

    function beacon_ERC721Facet() public pure returns (string memory) { return "ERC721Facet::1.0.2"; }

    //ERC721 MetaData for Honey
    function name(LibERC721.Typeoftoken tokenSelector) public view returns (string memory) {
        return LibERC721.layout().idFeatures[uint256(tokenSelector)].name;
    }

    function symbol(LibERC721.Typeoftoken tokenSelector) public view returns (string memory) {
        return LibERC721.layout().idFeatures[uint256(tokenSelector)].symbol;
    }

    function totalSupply() public view returns (uint256) {
        return LibERC721.layout().allTokens.length;
    }

    function tokenOfOwnerByIndex(
        address owner,
        uint256 index
    ) public view virtual returns (uint256) {
        if (index >= balanceOf(owner)) {
            revert ERC721Errors.ERC721OutOfBoundsIndex(owner, index);
        }
        return LibERC721.layout().ownedTokens[owner][index];
    }

    function tokenByIndex(uint256 index) public view virtual returns (uint256) {
        if (index >= totalSupply()) {
            revert ERC721Errors.ERC721OutOfBoundsIndex(address(0), index);
        }
        return LibERC721.layout().allTokens[index];
    }

    function balanceOf(address owner) public view returns (uint256) {
        if (owner == address(0)) revert ERC721Errors.ERC721InvalidOwner(owner);
        return LibERC721.layout().balances[owner];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        return LibERC721._requireOwned(tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public {
        safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public {
        transferFrom(from, to, tokenId);
        LibERC721.checkOnERC721Received(msg.sender, from, to, tokenId, data);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual {
        if (to == address(0))
            revert ERC721Errors.ERC721InvalidReceiver(address(0));

        address previousOwner = LibERC721._update(to, tokenId, msg.sender);
        if (previousOwner != from)
            revert ERC721Errors.ERC721IncorrectOwner(
                from,
                tokenId,
                previousOwner
            );
    }

    function approve(address to, uint256 tokenId) public {
        LibERC721._approve(to, tokenId, msg.sender);
    }

    function setApprovalForAll(address operator, bool approved) public virtual {
        LibERC721._setApprovalForAll(msg.sender, operator, approved);
    }

    function getApproved(uint256 tokenId) public view returns (address) {
        LibERC721._requireOwned(tokenId);

        return LibERC721._getApproved(tokenId);
    }

    function isApprovedForAll(
        address owner,
        address operator
    ) public view returns (bool) {
        return LibERC721.layout().operatorApprovals[owner][operator];
    }

    function contractURI(LibERC721.Typeoftoken tokenSelector) public view returns (string memory) {
        return
            string(
                abi.encodePacked(
                    /* solhint-disable */
                    "data:application/json;base64,",
                    Base64.encode(
                        abi.encodePacked(
                            '{"name":"',
                            name(tokenSelector),
                            '","description":"',
                            _contractDescription(),
                            '","image":"',
                            _contractImage(),
                            '"}'
                        )
                    )
                    /* solhint-enable */
                )
            );
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        LibERC721._requireOwned(tokenId);

        string memory baseURI = _baseURI();
        return
            bytes(baseURI).length > 0
                ? string.concat(baseURI, tokenId.toString(), ".json")
                : "";
    }

    function _baseURI() internal view virtual returns (string memory) {
        return "ipfs://something/";
    }

    function _contractImage() internal pure returns (bytes memory) {
        return "ipfs://Qmcig9eH8XWEZZuF9ZGQD7gAAHMDj79sT8ud787PgD57uN";
    }

    function _contractDescription() internal pure returns (string memory) {
        return
            'This is contract description.'
            "Depolyed by justwei's ERC721 Diamond implementation.";
    }
}