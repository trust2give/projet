// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

import "./LibTexts.sol";


/* Librairy LibObjCard - Version Remix Compiler 0.8.18 OK : 27/05/2023 Edition 1.0
 * @title BaseCard library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente la structure de données et les fonctions
        associées pour traiter les données d'identité des objets dans la ruche
        Une structure BaseCard est définie qui regroupe les informations usuelles
        communues à tous les objets / tokens
 */

/* Structure ObjCard de base pour la plupart des objects / token
 * regroupe les informations communes d'identification des objects
 */

struct ObjCard {
  TextLog name;
  TextLog description;
  TextLog logo;
  bytes32 parent;
  address author;  
  bool init;
}

library LibObjCard {

    using LibTexts for TextLog;
   // using LibErrors for *;

    function beacon_LibObjCard() public pure returns (string memory) { return "LibObjCard::1.0.0"; }

    function create(ObjCard storage _self, string memory _name, bytes32 _parent) external {
        // On initialise une nouvelle ObjCard. On test si la ObjCard passée n'est pas déjà initialisée (init = true)
        if (_self.init) revert("Already initialized");
        uint256 stamp = block.timestamp;
        _self.name.change(TextType.ENTITY, _name, "Root", stamp);
        _self.description.change(TextType.DETAIL, "<None>", "Root", stamp);
        _self.logo.change(TextType.IMAGE, "<None>", "Root", stamp);
        _self.author = msg.sender;
        _self.parent = _parent;
        _self.init = true;
        }

    function Name(ObjCard storage _self, string memory _name, string memory _tag) external {
        if (_self.init) revert("Already initialized");
        uint256 stamp = block.timestamp;
        _self.name.change(TextType.ENTITY, _name, _tag, stamp);
        _self.description.newTag(_tag, stamp);
        _self.logo.newTag(_tag, stamp);
        }

    function Description(ObjCard storage _self, string memory _detail, string memory _tag) external {
        uint256 stamp = block.timestamp;
        _self.description.change(TextType.FIRSTNAME, _detail, _tag, stamp);
        _self.name.newTag(_tag, stamp);
        _self.logo.newTag(_tag, stamp);
        }

    function Logo(ObjCard storage _self, string memory _logo, string memory _tag) external {
        uint256 stamp = block.timestamp;
        _self.logo.change( TextType.IMAGE, _logo, _tag, stamp);
        _self.name.newTag(_tag, stamp);
        _self.description.newTag(_tag, stamp);
        }

    function Author(ObjCard storage _self, address _author) external {
        if (_self.init) revert("Already initialized");
        _self.author = _author; //.notNull( "Author");
        }

    function current(ObjCard storage _self) external view returns (string memory _name, string memory _detail, string memory _logo, bytes32 _parent, string memory _tag) {
        TextType text;
        uint256 stamp;

        if (!_self.init) revert("Not initialized");
        (text, _name, stamp, _tag) = _self.name.current();
        (text, _detail, stamp, _tag) = _self.description.current();
        (text, _logo, stamp, _tag) = _self.logo.current();
        _parent = _self.parent;
        }

    function previous(ObjCard storage _self, uint256 _rank) external view returns (string memory _name, string memory _detail, string memory _logo, string memory _tag) {
        TextType text;
        uint256 stamp;

        if (!_self.init) revert("Not initialized");
        (text, _name, stamp, _tag) = _self.name.previous(_rank);
        (text, _detail, stamp, _tag) = _self.description.previous(_rank);
        (text, _logo, stamp, _tag) = _self.logo.previous(_rank);
        }

    function Tags(ObjCard storage _self, uint256 _rank) external view returns (string memory _name, string memory _detail, string memory _logo) {
        TextType text;
        string memory value;
        uint256 stamp;

        if (!_self.init) revert("Not initialized");
        (text, value, stamp, _name) = _self.name.previous(_rank);
        (text, value, stamp, _detail) = _self.description.previous(_rank);
        (text, value, stamp, _logo) = _self.logo.previous(_rank);
        }

}