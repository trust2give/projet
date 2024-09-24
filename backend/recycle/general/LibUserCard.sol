// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

//import "../AppStorage.sol";
import "./LibTexts.sol";
import "./LibOwners.sol";


/* Librairy LibUserCard - Version Remix Compiler 0.8.18 OK : 27/05/2023 Edition 1.0
 * @title BaseCard library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente la structure de données et les fonctions
        associées pour traiter les données d'identité des objets dans la ruche
        Une structure BaseCard est définie qui regroupe les informations usuelles
        communues à tous les objets / tokens
 */

/* Structure UserCard de base pour la plupart des objects / token
 * regroupe les informations communes d'identification des objects
 */

struct UserCard {
  TextLog lastName;
  TextLog firstName;
  TextLog email;
  TextLog avatar;
  OwnerLog owner;           
  address author;
  bool init;
}

library LibUserCard {

    using LibTexts for TextLog;
   // using LibErrors for *;
    using LibOwners for OwnerLog;

    function beacon_LibUserCard() public pure returns (string memory) { return "LibUserCard::1.0.0"; }

    function create(UserCard storage _self, string memory _LastName, string memory _firstName, string memory _email)
    public {
        // On initialise une nouvelle UserCard. On test si la UserCard passée n'est pas déjà initialisée (init = true)
        if (!_self.init) {
            uint256 stamp = block.timestamp;
            _self.lastName.change(TextType.LASTNAME, _LastName, "Root", stamp);
            _self.firstName.change(TextType.FIRSTNAME, _firstName, "Root", stamp);
            _self.email.change(TextType.EMAIL, _email, "Root", stamp);
            _self.avatar.change(TextType.IMAGE, "<None>", "Root", stamp);
            _self.owner.change(OwnerType.NONE, "<None>", "Root", stamp);
            _self.author = msg.sender;
            _self.init = true;
            }
        }

    function Owner(UserCard storage _self, OwnerType _owner, bytes32 _id, string memory _tag)
    public {
        if (_self.init) {
            uint256 stamp = block.timestamp;
            _self.owner.change( _owner, _id, _tag, stamp);
            _self.lastName.newTag(_tag, stamp);
            _self.firstName.newTag(_tag, stamp);
            _self.email.newTag(_tag, stamp);
            _self.avatar.newTag(_tag, stamp);
            }
        }

    function LastName(UserCard storage _self, string memory _lastName, string memory _tag)
    public {
        if (_self.init) {
            uint256 stamp = block.timestamp;
            _self.lastName.change(TextType.LASTNAME, _lastName, _tag, stamp);
            _self.firstName.newTag(_tag, stamp);
            _self.email.newTag(_tag, stamp);
            _self.avatar.newTag(_tag, stamp);
            _self.owner.newTag(_tag, stamp);
            }
        }

    function FirstName(UserCard storage _self, string memory _firstName, string memory _tag)
    public {
        if (_self.init) {
            uint256 stamp = block.timestamp;
            _self.firstName.change(TextType.FIRSTNAME, _firstName, _tag, stamp);
            _self.lastName.newTag(_tag, stamp);
            _self.email.newTag(_tag, stamp);
            _self.avatar.newTag(_tag, stamp);
            _self.owner.newTag(_tag, stamp);
            }
        }

    function Avatar(UserCard storage _self, string memory _path, string memory _tag)
    public {
        if (_self.init) {
            uint256 stamp = block.timestamp;
            _self.avatar.change( TextType.IMAGE, _path, _tag, stamp);
            _self.lastName.newTag(_tag, stamp);
            _self.email.newTag(_tag, stamp);
            _self.firstName.newTag(_tag, stamp);
            _self.owner.newTag(_tag, stamp);
            }
        }

    function Email(UserCard storage _self, string memory _email, string memory _tag)
    public {
        if (_self.init) {
            uint256 stamp = block.timestamp;
            _self.email.change( TextType.EMAIL, _email, _tag, stamp);
            _self.lastName.newTag(_tag, stamp);
            _self.avatar.newTag(_tag, stamp);
            _self.firstName.newTag(_tag, stamp);
            _self.owner.newTag(_tag, stamp);
            }
        }

    function Author(UserCard storage _self, address _author)
    public {
        if (_self.init) {
            _self.author = _author; //.notNull( "Author");
            }
        }

    function current(UserCard storage _self) public view
    returns (string memory _first, string memory _last, string memory _email, string memory _avatar, bytes32 _owner, string memory _tag) {
        TextType text;
        OwnerType own;
        uint256 stamp;

        if (_self.init) {
            (text, _last, stamp, _tag) = _self.lastName.current();
            (text, _first, stamp, _tag) = _self.firstName.current();
            (text, _email, stamp, _tag) = _self.email.current();
            (text, _avatar, stamp, _tag) = _self.avatar.current();
            (own, _owner, stamp, _tag) = _self.owner.current();
            }
        }

    function previous(UserCard storage _self, uint256 _rank) public view
    returns (string memory _first, string memory _last, string memory _email, string memory _avatar, bytes32 _owner, string memory _tag) {
        TextType text;
        OwnerType own;
        uint256 stamp;

        if (_self.init) {
            (text, _last, stamp, _tag) = _self.lastName.previous(_rank);
            (text, _first, stamp, _tag) = _self.firstName.previous(_rank);
            (text, _email, stamp, _tag) = _self.email.previous(_rank);
            (text, _avatar, stamp, _tag) = _self.avatar.previous(_rank);
            (own, _owner, stamp, _tag) = _self.owner.previous(_rank);
            }
        }

    function Tags(UserCard storage _self, uint256 _rank) public view
    returns (string memory _first, string memory _last, string memory _email, string memory _avatar, string memory _owner) {
        TextType text;
        string memory value;
        bytes32 id;
        OwnerType own;
        uint256 stamp;

        if (_self.init) {
            (text, value, stamp, _last) = _self.lastName.previous(_rank);
            (text, value, stamp, _first) = _self.firstName.previous(_rank);
            (text, value, stamp, _email) = _self.email.previous(_rank);
            (text, value, stamp, _avatar) = _self.avatar.previous(_rank);
            (own, id, stamp, _owner) = _self.owner.previous(_rank);
            }
        }

}