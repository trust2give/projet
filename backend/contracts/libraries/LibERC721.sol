// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {ERC721Errors} from "./Errors.sol";
import {ERC721Events} from "./Events.sol";
import {T2GTypes} from "./Types.sol";

library LibERC721 {

    /**
     * @dev Define the type of ERC721 Token that is stored
     * T2G Specific enum type
     */
    enum Typeoftoken {
        None,
        Pollen,
        Honey,
        Nektar,
        Cell
    }

    /**
     * @dev Define the status of ERC721 Token that is stored
     * T2G Specific enum type, which values depends on the token
     * Honey  : draft / validated / active / burnt / canceled
     * Pollen : draft / validated / certified / active / burnt / canceled
     */
    enum Statusoftoken {
        None,
        draft,
        validated,
        certified,
        active,
        burnt,
        canceled
    }

    /**
     * @dev Define the data specific structure of ERC721 Token that is stored
     * T2G Specific struct type, which attributes depends on the token
     * Honey  : token / state / created / updated / value / valueUnit [CoinUnit] / rate / hash 
     * Pollen : token / state / created / updated / value / valueUnit [SizeUnit] / uri / sector / 
     */
    struct TokenStruct {
        Typeoftoken token;
        Statusoftoken state;
        uint256 created;        // Timestamp : creation time of the new Token
        uint256 updated;        // Timestamp : last update time of the Token before it turns "Active"
        uint256 value;              // Represent the quantity of a single token  
        T2GTypes.sizeUnit size;     // Represents the scale / unit of the quantity if stated as a weight
        T2GTypes.CoinUnit unit;     // Represents the scale / unit of the value is stated as a currency
        bytes32 owner;              // Represents the Id of the related entity / fundez for token
        bytes32 asset;              // Represents the Id of the related asset for token
        }

    struct TokenFundSpecific {
        Statusoftoken state;
        uint256 value;              // Represent the quantity of a single token  
        T2GTypes.CoinUnit unit;     // Represents the scale / unit of the value is stated as a currency
        bytes32 hash0;                  // hash of recorded transactions of stablecoin transfers
        uint8 rate;                     // Percentage value (optional) for Honey applicable to amount dedicated to Gift versus Project Funding
        }

    struct TokenRewardSpecific {
        uint8 valueUnit;        // Either a T2GTypes.CoinUnit or T2GTypes.sizeUnit depending on the type of Token
        string label;
        }

    struct TokenRWASpecific {
        Statusoftoken state;
        uint256 value;
        T2GTypes.sizeUnit size;     // Represents the scale / unit of the quantity if stated as a weight
        T2GTypes.GainSource source;
        T2GTypes.GainScope scope;
        T2GTypes.GainType gain; 
        bytes32 report1;          // Uri links to BEGES documents that certify the value for Pollen
        bytes32 report2;          // Uri links to BEGES documents that certify the value for Pollen
        }

    struct TokenEntitySpecific {
        Statusoftoken state;
        string name;
        string uid;
        string email;
        string postal;
        T2GTypes.EntityType entity;
        T2GTypes.BusinessSector sector;
        T2GTypes.UnitType unitType;
        T2GTypes.UnitSize unitSize;
        T2GTypes.countries country;
        }

    // Represents the value and features of the different tokens of T2GTypes
    // these values can be managed and updated by the T2GOwner (name / symbol / logo)
    // of by the stakeholders of the CELLS (value, size, unit)
    // They represents the values given to any new token when minting.
    struct TokenIdCard {
        string name;
        string symbol;
        string logo;
        uint256 value;              // Represent the quantity of a single token  
        T2GTypes.sizeUnit size;     // Represents the scale / unit of the quantity if stated as a weight
        T2GTypes.CoinUnit unit;     // Represents the scale / unit of the value is stated as a currency
        }

    bytes32 internal constant STORAGE_SLOT = keccak256("diamond.storage.erc721");

    struct Layout {
        address root;
        uint256[] allTokens;
        bytes32[] allFunds;
        bytes32[] allRwas;
        bytes32[] allEntities;
        mapping(uint256 typeId => TokenIdCard) idFeatures;
        mapping(uint256 tokenId => address) owners;
        mapping(address owner => uint) balances;
        mapping(uint256 tokenId => address) tokenApprovals;
        mapping(address owner => mapping(address operator => bool)) operatorApprovals;
        mapping(address owner => mapping(uint256 index => uint256)) ownedTokens;
        mapping(uint256 => uint256) ownedTokensIndex;
        mapping(uint256 tokenId => uint256) allTokensIndex;

        // Token structures (common parts and specific ones)
        mapping(uint256 tokenId => TokenStruct) token;                     // common to all tokens
        mapping(bytes32 fundId => TokenFundSpecific) fund;                 // specific to fund tokens (Honey)
        mapping(uint256 rewardId => TokenRewardSpecific) reward;           // specific to reward tokens (Nektar)
        mapping(bytes32 entityId => TokenEntitySpecific) entity;           // specific to rwa tokens (pollen)
        mapping(bytes32 rwaId => TokenRWASpecific) rwa;                    // specific to rwa tokens (pollen)
        mapping(bytes32 fundId => mapping (uint256 => bool)) bwList;

        uint256[88] _gaps; // Not used. YTBD what is it for in the scope of ERC721 token?
    }

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }

    /**
     * @dev additional function to parse & decode data structure 
     * NEW : T2G specific
     */

    function parseDataBytesToTokenStruct(bytes memory _data) public pure returns (TokenStruct memory) {
        (TokenStruct memory result) = abi.decode(_data, (TokenStruct));
        //
        return result;
    }

    /**
     * @dev additional function to parse & decode data structure 
     * NEW : T2G specific
     */

    function parseDataBytesToTokenEntitySpecific(bytes memory _data) public pure returns (TokenEntitySpecific memory) {
        (TokenEntitySpecific memory result) = abi.decode(_data, (TokenEntitySpecific));
        return result;
    }

    /**
     * @dev checks if tokenId is a specific type of token of type Typeoftoken and belong to the caller as owner
     * @dev 
     * @dev 
     */

    function _tokenOfType(uint256 tokenId, Typeoftoken token) internal view returns (bool) {
        if (_ownerOf(tokenId) == address(0)) {
            revert ERC721Errors.ERC721NonexistentToken(tokenId);
            }
        return (layout().token[tokenId].token == token);
        }

    /**
     * @dev Returns the owner of the `tokenId`. Does NOT revert if token doesn't exist
     *
     * IMPORTANT: Any overrides to this function that add ownership of tokens not tracked by the
     * core ERC-721 logic MUST be matched with the use of {_increaseBalance} to keep balances
     * consistent with ownership. The invariant to preserve is that for any address `a` the value returned by
     * `balanceOf(a)` must be equal to the number of tokens such that `_ownerOf(tokenId)` is `a`.
     */
    function _ownerOf(uint256 tokenId) internal view returns (address) {
        return layout().owners[tokenId];
    }

    /**
     * @dev Returns the common details of the `tokenId`. Does NOT revert if token doesn't exist
     * NEW: T2G specific
     */
    function _tokenCommonFeatures(uint256 tokenId) internal view returns (TokenStruct memory) {
        return layout().token[tokenId];
        }

    /**
     * @dev Returns the Fund specific details of the `tokenId`. Does NOT revert if token doesn't exist
     * NEW: T2G specific
     */
    function _tokenFundFeatures(bytes32 fundId) internal view returns (TokenFundSpecific storage) {
        return layout().fund[fundId];
        }

    /**
     * @dev Returns the Rwa specific details of the `tokenId`. Does NOT revert if token doesn't exist
     * NEW: T2G specific
     */
    function _tokenRwaFeatures(bytes32 rwaId) internal view returns (TokenRWASpecific storage) {
        return layout().rwa[rwaId];
        }

    /**
     * @dev Returns the entity specific details of the `tokenId`. Does NOT revert if token doesn't exist
     * NEW: T2G specific
     */
    function _tokenEntityFeatures(bytes32 entityId) internal view returns (TokenEntitySpecific memory) {
        return layout().entity[entityId];
        }

    /**
     * @dev Returns the approved address for `tokenId`. Returns 0 if `tokenId` is not minted.
     */
    function _getApproved(uint256 tokenId) internal view returns (address) {
        return layout().tokenApprovals[tokenId];
    }

    /**
     * @dev Returns the list of pollen Ids that are related to a specific _entity Id
     */

    function _getTokensWithEntity( bytes32 _entity, Typeoftoken _type, Statusoftoken _state )
        internal view returns (uint256[] memory) {

        // We work out the number of tokens that match the criterias : _owner, _type & _state
        // 
        uint256 i;
        uint256 _number = 0;        
        for (i = 0; i < layout().allTokens.length; i++) {
            if ((layout().token[i].token == _type) || (_type == Typeoftoken.None)) {
                if ((layout().token[i].state == _state) || (_state == Statusoftoken.None)) {
                    if ((layout().token[i].owner == _entity) || (_entity == bytes32(0))) _number++;
                    }
                }
            }

        uint256[] memory _list = new uint256[](_number);
        _number = 0;
 
        for (i = 0; i < layout().allTokens.length; i++) {
            if ((layout().token[i].token == _type) || (_type == Typeoftoken.None)) {
                if ((layout().token[i].state == _state) || (_state == Statusoftoken.None)) {
                    if ((layout().token[i].owner == _entity) || (_entity == bytes32(0))) _list[_number++] = i;
                    }
                }
            }

        return _list;
        }

    /**
     * @dev Returns the list of pollen Ids that are related to a specific _gain Id
     */
    function _getTokensWithAsset( bytes32 _asset, Typeoftoken _type, Statusoftoken _state )
        internal view returns (uint256[] memory) {

        // We work out the number of tokens that match the criterias : _owner, _type & _state
        // 
        uint256 i;
        uint256 _number = 0;        
        for (i = 0; i < layout().allTokens.length; i++) {
            if ((layout().token[i].token == _type) || (_type == Typeoftoken.None)) {
                if ((layout().token[i].state == _state) || (_state == Statusoftoken.None)) {
                    if ((layout().token[i].asset == _asset) || (_asset == bytes32(0))) _number++;
                    }
                }
            }

        uint256[] memory _list = new uint256[](_number);
        _number = 0;
 
        for (i = 0; i < layout().allTokens.length; i++) {
            if ((layout().token[i].token == _type) || (_type == Typeoftoken.None)) {
                if ((layout().token[i].state == _state) || (_state == Statusoftoken.None)) {
                    if ((layout().token[i].asset == _asset) || (_asset == bytes32(0))) _list[_number++] = i;
                    }
                }
            }

        return _list;
        }


    /**
     * @dev Returns whether `spender` is allowed to manage `owner`'s tokens, or `tokenId` in
     * particular (ignoring whether it is owned by `owner`).
     *
     * WARNING: This function assumes that `owner` is the actual owner of `tokenId` and does not verify this
     * assumption.
     */
    function _isAuthorized(
        address owner,
        address spender,
        uint256 tokenId
    ) internal view returns (bool) {
        return
            spender != address(0) &&
            (owner == spender ||
                layout().operatorApprovals[owner][spender] ||
                _getApproved(tokenId) == spender);
    }

    /**
     * @dev Checks if `spender` can operate on `tokenId`, assuming the provided `owner` is the actual owner.
     * Reverts if `spender` does not have approval from the provided `owner` for the given token or for all its assets
     * the `spender` for the specific `tokenId`.
     *
     * WARNING: This function assumes that `owner` is the actual owner of `tokenId` and does not verify this
     * assumption.
     */
    function _checkAuthorized(
        address owner,
        address spender,
        uint256 tokenId
    ) internal view {
        if (!_isAuthorized(owner, spender, tokenId)) {
            if (owner == address(0)) {
                revert ERC721Errors.ERC721NonexistentToken(tokenId);
            } else {
                revert ERC721Errors.ERC721InsufficientApproval(
                    spender,
                    tokenId
                );
            }
        }
    }

    /**
     * @dev Unsafe write access to the balances, used by extensions that "mint" tokens using an {ownerOf} override.
     *
     * NOTE: the value is limited to type(uint128).max. This protect against _balance overflow. It is unrealistic that
     * a uint256 would ever overflow from increments when these increments are bounded to uint128 values.
     *
     * WARNING: Increasing an account's balance using this function tends to be paired with an override of the
     * {_ownerOf} function to resolve the ownership of the corresponding tokens so that balances and ownership
     * remain consistent with one another.
     */
    function _increaseBalance(address account, uint128 amount) internal {
        if (amount > 0) {
            revert ERC721Errors.ERC721EnumerableForbiddenBatchMint();
        }
        unchecked {
            layout().balances[account] += amount;
        }
    }

    /**
     * @dev Transfers `tokenId` from its current owner to `to`, or alternatively mints (or burns) if the current owner
     * (or `to`) is the zero address. Returns the owner of the `tokenId` before the update.
     *
     * The `auth` argument is optional. If the value passed is non 0, then this function will check that
     * `auth` is either the owner of the token, or approved to operate on the token (by the owner).
     *
     * Emits a {Transfer} event.
     *
     * NOTE: If overriding this function in a way that tracks balances, see also {_increaseBalance}.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal returns (address) {
        address previousOwner = _ownerOf(tokenId);

        // Perform (optional) operator check
        if (auth != address(0)) {
            _checkAuthorized(previousOwner, auth, tokenId);
        }

        // Execute the update
        if (previousOwner != address(0)) {
            // Clear approval. No need to re-authorize or emit the Approval event
            _approve(address(0), tokenId, address(0), false);

            unchecked {
                layout().balances[previousOwner] -= 1;
            }
        }

        if (to != address(0)) {
            unchecked {
                layout().balances[to] += 1;
            }
        }

        layout().owners[tokenId] = to;

        emit ERC721Events.Transfer(previousOwner, to, tokenId);

        if (previousOwner == address(0)) {
            _addTokenToAllTokensEnumeration(tokenId);
        } else if (previousOwner != to) {
            _removeTokenFromOwnerEnumeration(previousOwner, tokenId);
        }
        if (to == address(0)) {
            _removeTokenFromAllTokensEnumeration(tokenId);
        } else if (previousOwner != to) {
            _addTokenToOwnerEnumeration(to, tokenId);
        }

        return previousOwner;
    }

    /**
     * @dev Private function to add a token to this extension's ownership-tracking data structures.
     * @param to address representing the new owner of the given token ID
     * @param tokenId uint256 ID of the token to be added to the tokens list of the given address
     */
    function _addTokenToOwnerEnumeration(address to, uint256 tokenId) internal {
        uint256 length = layout().balances[to] - 1;
        layout().ownedTokens[to][length] = tokenId;
        layout().ownedTokensIndex[tokenId] = length;
    }

    /**
     * @dev Private function to add a token to this extension's token tracking data structures.
     * @param tokenId uint256 ID of the token to be added to the tokens list
     */
    function _addTokenToAllTokensEnumeration(uint256 tokenId) internal {
        layout().allTokensIndex[tokenId] = layout().allTokens.length;
        layout().allTokens.push(tokenId);
    }

    /**
     * @dev Private function to remove a token from this extension's ownership-tracking data structures. Note that
     * while the token is not assigned a new owner, the `_ownedTokensIndex` mapping is _not_ updated: this allows for
     * gas optimizations e.g. when performing a transfer operation (avoiding double writes).
     * This has O(1) time complexity, but alters the order of the _ownedTokens array.
     * @param from address representing the previous owner of the given token ID
     * @param tokenId uint256 ID of the token to be removed from the tokens list of the given address
     */
    function _removeTokenFromOwnerEnumeration(
        address from,
        uint256 tokenId
    ) internal {
        // To prevent a gap in from's tokens array, we store the last token in the index of the token to delete, and
        // then delete the last slot (swap and pop).

        uint256 lastTokenIndex = layout().balances[from];
        uint256 tokenIndex = layout().ownedTokensIndex[tokenId];

        // When the token to delete is the last token, the swap operation is unnecessary
        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = layout().ownedTokens[from][lastTokenIndex];

            layout().ownedTokens[from][tokenIndex] = lastTokenId; // Move the last token to the slot of the to-delete token
            layout().ownedTokensIndex[lastTokenId] = tokenIndex; // Update the moved token's index
        }

        // This also deletes the contents at the last position of the array
        delete layout().ownedTokensIndex[tokenId];
        delete layout().ownedTokens[from][lastTokenIndex];
    }

    /**
     * @dev Private function to remove a token from this extension's token tracking data structures.
     * This has O(1) time complexity, but alters the order of the _allTokens array.
     * @param tokenId uint256 ID of the token to be removed from the tokens list
     */
    function _removeTokenFromAllTokensEnumeration(uint256 tokenId) internal {
        // To prevent a gap in the tokens array, we store the last token in the index of the token to delete, and
        // then delete the last slot (swap and pop).

        uint256 lastTokenIndex = layout().allTokens.length - 1;
        uint256 tokenIndex = layout().allTokensIndex[tokenId];

        // When the token to delete is the last token, the swap operation is unnecessary. However, since this occurs so
        // rarely (when the last minted token is burnt) that we still do the swap here to avoid the gas cost of adding
        // an 'if' statement (like in _removeTokenFromOwnerEnumeration)
        uint256 lastTokenId = layout().allTokens[lastTokenIndex];

        layout().allTokens[tokenIndex] = lastTokenId; // Move the last token to the slot of the to-delete token
        layout().allTokensIndex[lastTokenId] = tokenIndex; // Update the moved token's index

        // This also deletes the contents at the last position of the array
        delete layout().allTokensIndex[tokenId];
        layout().allTokens.pop();
    }

    /**
     * @dev Mints `tokenId` and transfers it to `to`.
     *
     * WARNING: Usage of this method is discouraged, use {_safeMint} whenever possible
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - `to` cannot be the zero address.
     *
     * Emits a {Transfer} event.
     */
    function _mint(address to, uint256 tokenId) internal {
        if (to == address(0)) {
            revert ERC721Errors.ERC721InvalidReceiver(address(0));
        }
        address previousOwner = _update(to, tokenId, address(0));
        if (previousOwner != address(0)) {
            revert ERC721Errors.ERC721InvalidSender(address(0));
        }
    }

    /**
     * @dev Mints `tokenId`, transfers it to `to` and checks for `to` acceptance.
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function _safeMint(address to, uint256 tokenId) internal {
        _safeMint(to, tokenId, "");
    }


    /**
     * @dev Same as {xref-ERC721-_safeMint-address-uint256-}[`_safeMint`], with an additional `data` parameter which is
     * forwarded in {IERC721Receiver-onERC721Received} to contract recipients.
     */
    function _safeMint(
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal {
        _mint(to, tokenId);
        checkOnERC721Received(msg.sender, address(0), to, tokenId, data);
        // On ajoute la structure qui est passée pour le type de Token qui est passé par l'input _data
        // NEW : specific to T2G 
        layout().token[tokenId] = parseDataBytesToTokenStruct(data);
    }

    /**
     * @dev Destroys `tokenId`.
     * The approval is cleared when the token is burned.
     * This is an internal function that does not check if the sender is authorized to operate on the token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     *
     * Emits a {Transfer} event.
     */
    function _burn(uint256 tokenId) internal {
        address previousOwner = _update(address(0), tokenId, address(0));
        if (previousOwner == address(0)) {
            revert ERC721Errors.ERC721NonexistentToken(tokenId);
        }
    }

    /**
     * @dev Transfers `tokenId` from `from` to `to`.
     *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     *
     * Emits a {Transfer} event.
     */
    function _transfer(address from, address to, uint256 tokenId) internal {
        if (to == address(0)) {
            revert ERC721Errors.ERC721InvalidReceiver(address(0));
        }
        address previousOwner = _update(to, tokenId, address(0));
        if (previousOwner == address(0)) {
            revert ERC721Errors.ERC721NonexistentToken(tokenId);
        } else if (previousOwner != from) {
            revert ERC721Errors.ERC721IncorrectOwner(
                from,
                tokenId,
                previousOwner
            );
        }
    }

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking that contract recipients
     * are aware of the ERC-721 standard to prevent tokens from being forever locked.
     *
     * `data` is additional data, it has no specified format and it is sent in call to `to`.
     *
     * This internal function is like {safeTransferFrom} in the sense that it invokes
     * {IERC721Receiver-onERC721Received} on the receiver, and can be used to e.g.
     * implement alternative mechanisms to perform token transfer, such as signature-based.
     *
     * Requirements:
     *
     * - `tokenId` token must exist and be owned by `from`.
     * - `to` cannot be the zero address.
     * - `from` cannot be the zero address.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function _safeTransfer(address from, address to, uint256 tokenId) internal {
        _safeTransfer(from, to, tokenId, "");
    }

    /**
     * @dev Same as {xref-ERC721-_safeTransfer-address-address-uint256-}[`_safeTransfer`], with an additional `data` parameter which is
     * forwarded in {IERC721Receiver-onERC721Received} to contract recipients.
     */
    function _safeTransfer(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal {
        _transfer(from, to, tokenId);
        checkOnERC721Received(msg.sender, from, to, tokenId, data);
    }

    /**
     * @dev Approve `to` to operate on `tokenId`
     *
     * The `auth` argument is optional. If the value passed is non 0, then this function will check that `auth` is
     * either the owner of the token, or approved to operate on all tokens held by this owner.
     *
     * Emits an {Approval} event.
     *
     * Overrides to this logic should be done to the variant with an additional `bool emitEvent` argument.
     */
    function _approve(address to, uint256 tokenId, address auth) internal {
        _approve(to, tokenId, auth, true);
    }

    /**
     * @dev Variant of `_approve` with an optional flag to enable or disable the {Approval} event. The event is not
     * emitted in the context of transfers.
     */
    function _approve(
        address to,
        uint256 tokenId,
        address auth,
        bool emitEvent
    ) internal {
        // Avoid reading the owner unless necessary
        if (emitEvent || auth != address(0)) {
            address owner = _requireOwned(tokenId);

            // We do not use _isAuthorized because single-token approvals should not be able to call approve
            if (
                auth != address(0) &&
                owner != auth &&
                !layout().operatorApprovals[owner][auth]
            ) {
                revert ERC721Errors.ERC721InvalidApprover(auth);
            }

            if (emitEvent) {
                emit ERC721Events.Approval(owner, to, tokenId);
            }
        }

        layout().tokenApprovals[tokenId] = to;
    }

    /**
     * @dev Approve `operator` to operate on all of `owner` tokens
     *
     * Requirements:
     * - operator can't be the address zero.
     *
     * Emits an {ApprovalForAll} event.
     */
    function _setApprovalForAll(
        address owner,
        address operator,
        bool approved
    ) internal {
        if (operator == address(0)) {
            revert ERC721Errors.ERC721InvalidOperator(operator);
        }
        layout().operatorApprovals[owner][operator] = approved;
        emit ERC721Events.ApprovalForAll(owner, operator, approved);
    }

    /**
     * @dev Reverts if the `tokenId` doesn't have a current owner (it hasn't been minted, or it has been burned).
     * Returns the owner.
     *
     * Overrides to ownership logic should be done to {_ownerOf}.
     */
    function _requireOwned(uint256 tokenId) internal view returns (address) {
        address owner = _ownerOf(tokenId);
        if (owner == address(0)) {
            revert ERC721Errors.ERC721NonexistentToken(tokenId);
        }
        return owner;
    }

    /**
     * @dev Performs an acceptance check for the provided `operator` by calling {IERC721-onERC721Received}
     * on the `to` address. The `operator` is generally the address that initiated the token transfer (i.e. `msg.sender`).
     *
     * The acceptance call is not executed and treated as a no-op if the target address is doesn't contain code (i.e. an EOA).
     * Otherwise, the recipient must implement {IERC721Receiver-onERC721Received} and return the acceptance magic value to accept
     * the transfer.
     */
    function checkOnERC721Received(
        address operator,
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal {
        if (to.code.length > 0) {
            try
                IERC721Receiver(to).onERC721Received(
                    operator,
                    from,
                    tokenId,
                    data
                )
            returns (bytes4 retval) {
                if (retval != IERC721Receiver.onERC721Received.selector) {
                    // Token rejected
                    revert ERC721Errors.ERC721InvalidReceiver(to);
                }
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    // non-IERC721Receiver implementer
                    revert ERC721Errors.ERC721InvalidReceiver(to);
                } else {
                    /// @solidity memory-safe-assembly
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        }
    }
}