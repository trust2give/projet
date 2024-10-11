// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {LibERC721} from "../libraries/LibERC721.sol";
//import {ERC721Errors} from "../libraries/Errors.sol";
import {T2GTypes} from "../libraries/Types.sol";

contract HoneyFacet {

    error HoneyInvalidTokenId(uint256 tokenId);
    event HoneySetWhiteList(uint256 tokenId, T2GTypes.BusinessSector _sector);
    event HoneySetBlackList(uint256 tokenId, T2GTypes.BusinessSector _sector);

    function beacon_HoneyFacet() public pure returns (string memory) { return "HoneyFacet::1.0.4"; }

    function balanceOf() external view returns (uint) {
        return address(this).balance;        
        }

    function honey(uint256 _tokenId) external view returns (LibERC721.Typeoftoken , LibERC721.Statusoftoken, uint256) {
        LibERC721.TokenStruct memory data = LibERC721._tokenFeatures(_tokenId);
        if (data.token == LibERC721.Typeoftoken.Honey) return (data.token, data.state, data.amount);
        revert HoneyInvalidTokenId(_tokenId);
        }

    function mintHoneyMint(address _to, uint256 _tokenId) external payable {
        LibERC721.TokenStruct memory _data;
        _data.token = LibERC721.Typeoftoken.Honey;
        _data.state = LibERC721.Statusoftoken.draft;
        _data.amount = msg.value;

        LibERC721._safeMint(_to, _tokenId, abi.encode(_data));
        }

    function setWhiteList( uint256 _tokenId, T2GTypes.BusinessSector _sector, bool _remove ) external {
        if (!LibERC721._tokenOfType( _tokenId, LibERC721.Typeoftoken.Honey )) {
            revert HoneyInvalidTokenId(_tokenId);
            }        
        LibERC721.layout().whitelist[_tokenId][uint256(_sector)] = _remove ? false : true;        
        emit HoneySetWhiteList(_tokenId, _sector);
        }

    function setBlackList( uint256 _tokenId, T2GTypes.BusinessSector _sector, bool _remove ) external {
        if (!LibERC721._tokenOfType( _tokenId, LibERC721.Typeoftoken.Honey )) {
            revert HoneyInvalidTokenId(_tokenId);
            }        
        LibERC721.layout().blacklist[_tokenId][uint256(_sector)] = _remove ? false : true;
        emit HoneySetBlackList(_tokenId, _sector);
        }

    function getWhiteList( uint256 _tokenId ) external view returns ( bool[] memory) {
        if (LibERC721._tokenOfType( _tokenId, LibERC721.Typeoftoken.Honey )) {
            bool[] memory memoryArray = new bool[](uint(type(T2GTypes.BusinessSector).max));
            for(uint i = 0; i < uint(type(T2GTypes.BusinessSector).max); i++) {
                memoryArray[i] = LibERC721.layout().whitelist[_tokenId][i];
                }
            return memoryArray;    
            }
        revert HoneyInvalidTokenId(_tokenId);
        }

    function getBlackList( uint256 _tokenId ) external view returns ( bool[] memory) {
        if (LibERC721._tokenOfType( _tokenId, LibERC721.Typeoftoken.Honey )) {
            bool[] memory memoryArray = new bool[](uint(type(T2GTypes.BusinessSector).max));
            for(uint i = 0; i < uint(type(T2GTypes.BusinessSector).max); i++) {
                memoryArray[i] = LibERC721.layout().blacklist[_tokenId][i];
                }
            return memoryArray;    
            }
        revert HoneyInvalidTokenId(_tokenId);
        }

    function burnHoney(uint256 _tokenId) external {
        if (LibERC721._tokenOfType( _tokenId, LibERC721.Typeoftoken.Honey )) {
            LibERC721._burn(_tokenId);
            }
        revert HoneyInvalidTokenId(_tokenId);
        }

}