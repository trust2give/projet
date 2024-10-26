// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {T2GTypes} from "./Types.sol";

library LibOwners {

    event SyndAlreadyRegistered(address _user);
    event SyndAlreadyBanned(address _user);
    event SyndNewRegistered(address _user);
    event SyndNewBanned(address _user);
    event SyndUnknown(address _user);

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
     */

    bytes32 internal constant STORAGE_SLOT = keccak256("diamond.storage.syndication");

    struct Syndication {
        address root;
        uint256 totalRegistered; // last index of registered users
        uint256 totalBanned;     // last index of banned users
        mapping(address => bool) registered;
        mapping(address => bool) banned;
        mapping(uint256 => address) registeredAtIndex;
        mapping(uint256 => address) bannedAtIndex;
        }

    function syndication() internal pure returns (Syndication storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
            }
        }

    /**
     * @dev Returns whether the address is registered or not.
     */
    function _isRegistered(address user) internal view returns (bool) {
        return user != address(0) && syndication().registered[user];
        }

    /**
     * @dev Returns whether the address is banned or not.
     */
    function _isBanned(address user) internal view returns (bool) {
        return user != address(0) && syndication().banned[user];
        }

    /**
     * @dev  
     */
    function _register( address user ) internal {
        if (user != address(0)) {
            if (!_isRegistered(user)) {
                syndication().registered[user] = true;
                syndication().registeredAtIndex[++syndication().totalRegistered] = user;
                syndication().banned[user] = false;
                emit SyndNewRegistered(user);
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
                    emit SyndNewBanned(user);
                    }
                }
            else emit SyndUnknown( user );
            }
        }

    }