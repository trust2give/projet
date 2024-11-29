// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {T2GTypes} from "./Types.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/utils/BIP39.sol";
//import "@OpenZeppelin/openzeppelin-solidity/contracts/utils/BIP39.sol";

library LibOwners {

    event SyndAlreadyRegistered(address _user);
    event SyndAlreadyBanned(address _user);
    event SyndNewRegistered(address _user, uint256 _stamp);
    event SyndNewBanned(address _user, uint256 _stamp);
    event SyndUnknown(address _user);
    event SyndRightsGranted(address _user);
    event SyndRightsDeclined(address _user);

    error SyndFordidden(address _user);

    /**
     * @dev Define the data specific structure of Syndication data that are stored
     * T2G Specific struct type that manage sign in or wallets to the service
     * 
     * NOTA : this contract aims at managing (grant or restrict) access to T2G service for wallet & smart contract addresses
     * The principle is that any new sign-up action is recorded allow address is registered with no further possibility to delete it for tracability purpose
     * However the right for an address to execute T2G functions is given as long as the address is not marked as banned.
     * Once an address is marked as banned, it can not be reverted any longer, and wallet can not longer access the T2G functions.
     * This allows T2G Smart Contract to request / check when a wallet is allowed or not to execute a function.
     *
     * YTBD : integrate in the smart contract the check that the wallet is well registered and not banned
     */

    bytes32 internal constant STORAGE_SLOT = keccak256("diamond.storage.syndication");

    struct Syndication {
        address root;               // @ for the T2G_Root of ERC2535. Duplicate with Layout.
        uint256 totalRegistered;    // last index of registered users
        uint256 totalBanned;        // last index of banned users
        mapping(address => address) boundWallet;
        mapping(address => bytes32) boundKey;
        mapping(address => bool) registered;
        mapping(address => bool) banned;
        mapping(address => uint256) timestamp;
        mapping(address => uint8) rights;           // list of flags USR_XXX that represent the profile of the user
        mapping(uint256 => address) registeredAtIndex;
        mapping(uint256 => address) bannedAtIndex;
        }

    function syndication() internal pure returns (Syndication storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
            }
        }

    /*function generatePrivateKey(string memory _seedPhrase) public pure returns (bytes32) {
        // Derive the master key using BIP39
        bytes32 masterKey = BIP39.deriveMasterKey(_seedPhrase, 256);
        // Extract the 32-byte private key
        bytes32 privateKey = masterKey[:32];
        return privateKey;
    }*/

    function generateAddress(bytes memory publicKey) internal pure returns (bytes20) {
        bytes32 keccakHash = keccak256(publicKey);
        return bytes20(keccakHash);
    }

    /**
     * @dev Returns whether the address is registered or not.
     */
    function _isRegistered(address user) internal view returns (bool) {
        return user != address(0) && syndication().registered[user];
        }

    /**
     * @notice Returns the granted rights for the user.
     * @dev the uint8 value is the aggregation of flags USR_XXX (type.sol)
     * @dev A wallet@ can have several mixed rights with the following combinations
     * @dev For Giver Wallet : USR_GIVERS & USR_OWNER (when getting CELLS)
     * @dev For public : USR_VIEWER only
     * @dev For Entreprises: USR_FARMS, USR_GRANTS, USR_COLLECTS, USR_ADMINS
     * @dev since a wallet can be giver and enterprise at the same time, all combinations are possibles
     * @return uint8 value représeting the flags
     */
    function _rights(address user) internal view returns (uint8) {
        if (!_isRegistered(user) || _isBanned(user)) revert SyndFordidden(user);
        return syndication().rights[user];
        }

    /**
     * @dev Returns whether the address is banned or not.
     */
    function _isBanned(address user) internal view returns (bool) {
        return user != address(0) && syndication().banned[user];
        }

    /**
     * @dev Returns whether the address has the given rights or not.
     */
    function _isAllowed(address user, uint8 rights) internal view returns (bool) {
        if (!_isRegistered(user) || _isBanned(user)) revert SyndFordidden(user);
        return ((syndication().rights[user] & rights) == rights);
        }

    /**
     * @dev Set new rights to the given user.
     */
    function _grantRights(address user, uint8 rights) internal {
        if (!_isRegistered(user) || _isBanned(user)) revert SyndFordidden(user);
        syndication().rights[user] |= rights;
        emit SyndRightsGranted(user);
        }

    /**
     * @dev Decline rights to the given user.
     */
    function _declineRights(address user, uint8 rights) internal {
        if (!_isRegistered(user) || _isBanned(user)) revert SyndFordidden(user);
        syndication().rights[user] &= ~rights;
        emit SyndRightsDeclined(user);
        }

    /**
     * @dev  
     */
    function _register( address user, uint8 _profile ) internal {
        if (user != address(0)) {
            if (!_isRegistered(user)) {
                syndication().registered[user] = true;
                syndication().registeredAtIndex[++syndication().totalRegistered] = user;
                syndication().banned[user] = false;
                syndication().rights[user] = _profile;
                // We update & record the time 
                syndication().timestamp[user] = block.timestamp;
 
                emit SyndNewRegistered(user, syndication().timestamp[user]);
                }
            else if (!_isBanned(user)) emit SyndAlreadyRegistered( user );
            else emit SyndAlreadyBanned( user );
            }
        }

    function _ban( address user ) internal {
        if (user != address(0)) {
            if (_isRegistered(user)) {
                if (_isBanned(user)) emit SyndAlreadyBanned( user );
                else {
                    syndication().banned[user] = true;
                    syndication().bannedAtIndex[++syndication().totalBanned] = user;
                    // We update & record the time 
                    syndication().timestamp[user] = block.timestamp;

                    emit SyndNewBanned(user, syndication().timestamp[user] );
                    }
                }
            else emit SyndUnknown( user );
            }
        }

    }