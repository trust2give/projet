// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {LibERC721} from "../libraries/LibERC721.sol";
import { DiamondLoupeFacet } from "./DiamondLoupeFacet.sol";
import {T2GTypes} from "../libraries/Types.sol";
import { LibDiamond } from "../libraries/LibDiamond.sol";
import { LibOwners } from "../libraries/LibOwners.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.fr>, Github: @fdervillez
* T2G_EntityFacet
*
* Implementation of a Trust2Give Entity.
* Version
* 1.0.1 : Creation of the smart contract
/******************************************************************************/

/// @title Contract that manages the Entity for Trust2Give dApp

contract T2G_EntityFacet {

    error EntityInvalidId(uint256 entityId);
    error EntityInvalidName();
    error EntityInvalidUId();
    error EntityInvalidCountry();
    error EntityInvalidSender(address sender);
    error EntityInvalidContractAddress();
    error EntityFailed(address owner, string reason);

    event EntityRootAddressSet( address root );
    event EntityUpdated( address owner, uint256 entityId );
    event EntityCreated( bytes32 entityId );

    modifier isT2GOwner {
        if (msg.sender != LibDiamond.contractOwner()) revert EntityInvalidSender(msg.sender);
        _;
        }

    constructor( address _root ) {
        if (_root == address(0)) revert EntityInvalidContractAddress();
        else if (LibERC721.layout().root == address(0)) {
            LibERC721.layout().root = _root;
            emit EntityRootAddressSet( _root );
            }
        else if (_root != LibERC721.layout().root) revert EntityInvalidContractAddress();
        }

     /// @notice checks that the deployed contract is alive and returns its version
     /// @dev the returned text is to be updated whenever a change in the contract is made and new deployment is carried out
     /// @return string that recalls the contact name + its current deployed version : "contractname::version"

    function beacon_EntityFacet() public pure returns (string memory) { return "T2G_EntityFacet::1.0.1"; }

     /// @notice returns the address of the the contract
     /// @dev All Facet in T2G application must implement this function of type "get_<Contract Name>()
     /// @return Address of the current instance of contract
    function get_T2G_EntityFacet() public view returns (address) {
        return DiamondLoupeFacet(LibERC721.layout().root).facetAddress(bytes4(abi.encodeWithSignature("beacon_EntityFacet()")));
        }


     /// @notice returns the features of a specific entity, given its entityId 
     /// @param _entityId token Id
     /// @dev MODIFIER : checks first that msg.sender is either the T2G owner or the token owner. Otherwise revert PollenInvalidOwner error
     /// @dev MODIFIER : checks then that tokenId refers to a Pollen and no other type of token. Otherwise revert PollenInvalidTokenId error
     /// @dev IMPORTANT : no checks is done if tokenId is null.
     /// @return tuple ( TokenStruct, TokenEntitySpecific, TokenRWASpecific) in abi encoded data format

    function entity(bytes32 _entityId) external view returns ( bytes memory ) {

        // We check first that the msg.sender if allowed and has the rights to view the pollen
        if (!LibOwners._isAllowed(msg.sender, T2GTypes.R_VIEWS )) revert EntityInvalidSender(msg.sender);

        LibERC721.TokenEntitySpecific memory _result = LibERC721._tokenEntityFeatures(_entityId);
        return (abi.encode(_result));
        }

     /// @notice Update features relates to the source Entity for a possible pollen
     /// @param _data the data for the new created entity
     /// @dev MODIFIER : checks first that msg.sender is T2G owner. Otherwise revert EntityInvalidSender error
     /// @dev this function act as a setter and overwrites an existing content with new values
     /// @dev the Id is worked out from the combination of name, uid & country which normally are enough 
     /// @dev to uniquely identify an entity. Uid represents in France the SIREN of the entity
     /// @dev once cheks are OK, then sets the adds the new entity 
     /// @return the Id of the created entity
    
    function setEntity( bytes memory _data ) external isT2GOwner returns (bytes32) {
        bytes32 _id;

        LibERC721.TokenEntitySpecific memory result = abi.decode(_data, (LibERC721.TokenEntitySpecific));
        
        if (bytes(result.name).length == 0) revert EntityInvalidName();
        if (bytes(result.uid).length == 0) revert EntityInvalidUId();
        if (result.country == T2GTypes.countries.NONE) revert EntityInvalidCountry();

        _id = keccak256( bytes(string.concat( string.concat(result.name, result.uid), Strings.toString(uint256(result.country)))) );

        LibERC721.layout().entity[_id].state = LibERC721.Statusoftoken.draft;
        LibERC721.layout().entity[_id].name = result.name;
        LibERC721.layout().entity[_id].uid = result.uid;
        LibERC721.layout().entity[_id].email = result.email;
        LibERC721.layout().entity[_id].postal = result.postal;
        LibERC721.layout().entity[_id].country = result.country;
        LibERC721.layout().entity[_id].entity = result.entity;
        LibERC721.layout().entity[_id].sector = result.sector;
        LibERC721.layout().entity[_id].unitType = result.unitType;
        LibERC721.layout().entity[_id].unitSize = result.unitSize;
                
        emit EntityCreated( _id );
        return _id;
        }

}