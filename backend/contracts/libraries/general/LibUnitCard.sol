// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

import "./LibTexts.sol";
import "./LibOwners.sol";


/* Librairy LibUnitCard - Version Remix Compiler 0.8.18 OK : 27/05/2023 Edition 1.0
 * @title BaseCard library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente la structure de données et les fonctions
        associées pour traiter les données d'identité des objets dans la ruche
        Une structure BaseCard est définie qui regroupe les informations usuelles
        communues à tous les objets / tokens
 */

/* Structure UnitCard de base pour la plupart des objects / token
 * regroupe les informations communes d'identification des objects
 */

struct UnitCard {
  TextLog name;
  TextLog description;
  TextLog siren;
  TextLog siret;
  TextLog logo;
  TextLog contact;  // Adresse email de contact associé à la Ruche modifiable
  OwnerLog owner;           
  address author;  
  bool init;
}

library LibUnitCard {

    using LibTexts for TextLog;
   // using LibErrors for *;
    using LibOwners for OwnerLog;

    function beacon_LibUnitCard() public pure returns (string memory) { return "LibUnitCard::1.0.0"; }

    function create(UnitCard storage _self, string memory _name, string memory _siren, string memory _siret)
    public {
        // On initialise une nouvelle UnitCard. On test si la UnitCard passée n'est pas déjà initialisée (init = true)
        if (!_self.init) {
            uint256 stamp = block.timestamp;
            _self.name.change(TextType.ENTITY, _name, "Root", stamp);
            _self.description.change(TextType.DETAIL, "<None>", "Root", stamp);
            _self.siren.change(TextType.SIREN, _siren, "Root", stamp);
            _self.siret.change(TextType.SIRET, _siret, "Root", stamp);
            _self.logo.change(TextType.IMAGE, "<None>", "Root", stamp);
            _self.owner.change(OwnerType.NONE, bytes32(0), "Root", stamp);
            _self.author = msg.sender;
            _self.init = true;
            }
        }

    function Contact(UnitCard storage _self, string memory _email, string memory _tag)
    public {
        if (_self.init) {
            uint256 stamp = block.timestamp;
            _self.contact.change( TextType.EMAIL, _email, _tag, stamp);
            _self.name.newTag(_tag, stamp);
            _self.description.newTag(_tag, stamp);
            _self.siren.newTag(_tag, stamp);
            _self.siret.newTag(_tag, stamp);
            _self.logo.newTag(_tag, stamp);
            _self.owner.newTag(_tag, stamp);
            }
        }

    function Owner(UnitCard storage _self, OwnerType _owner, bytes32 _id, string memory _tag)
    public {
        if (_self.init) {
            uint256 stamp = block.timestamp;
            _self.owner.change( _owner, _id, _tag, stamp);
            _self.name.newTag(_tag, stamp);
            _self.description.newTag(_tag, stamp);
            _self.siren.newTag(_tag, stamp);
            _self.siret.newTag(_tag, stamp);
            _self.logo.newTag(_tag, stamp);
            _self.contact.newTag(_tag, stamp);
            }
        }

    function Name(UnitCard storage _self, string memory _name, string memory _tag)
    public {
        if (_self.init) {
            uint256 stamp = block.timestamp;
            _self.name.change(TextType.ENTITY, _name, _tag, stamp);
            _self.description.newTag(_tag, stamp);
            _self.siren.newTag(_tag, stamp);
            _self.siret.newTag(_tag, stamp);
            _self.logo.newTag(_tag, stamp);
            _self.owner.newTag(_tag, stamp);
            _self.contact.newTag(_tag, stamp);
            }
        }

    function Description(UnitCard storage _self, string memory _detail, string memory _tag)
    public {
        if (_self.init) {
            uint256 stamp = block.timestamp;
            _self.description.change(TextType.FIRSTNAME, _detail, _tag, stamp);
            _self.name.newTag(_tag, stamp);
            _self.siren.newTag(_tag, stamp);
            _self.siret.newTag(_tag, stamp);
            _self.logo.newTag(_tag, stamp);
            _self.owner.newTag(_tag, stamp);
            _self.contact.newTag(_tag, stamp);
            }
        }

    function Siren(UnitCard storage _self, string memory _siren, string memory _tag)
    public {
        if (_self.init) {
            uint256 stamp = block.timestamp;
            _self.siren.change( TextType.SIREN, _siren, _tag, stamp);
            _self.name.newTag(_tag, stamp);
            _self.description.newTag(_tag, stamp);
            _self.siret.newTag(_tag, stamp);
            _self.logo.newTag(_tag, stamp);
            _self.owner.newTag(_tag, stamp);
            _self.contact.newTag(_tag, stamp);
            }
        }

    function Siret(UnitCard storage _self, string memory _siret, string memory _tag)
    public {
        if (_self.init) {
            uint256 stamp = block.timestamp;
            _self.siret.change( TextType.SIRET, _siret, _tag, stamp);
            _self.name.newTag(_tag, stamp);
            _self.description.newTag(_tag, stamp);
            _self.siren.newTag(_tag, stamp);
            _self.logo.newTag(_tag, stamp);
            _self.owner.newTag(_tag, stamp);
            _self.contact.newTag(_tag, stamp);
            }
        }

    function Logo(UnitCard storage _self, string memory _logo, string memory _tag)
    public {
        if (_self.init) {
            uint256 stamp = block.timestamp;
            _self.logo.change( TextType.IMAGE, _logo, _tag, stamp);
            _self.name.newTag(_tag, stamp);
            _self.description.newTag(_tag, stamp);
            _self.siren.newTag(_tag, stamp);
            _self.siret.newTag(_tag, stamp);
            _self.owner.newTag(_tag, stamp);
            _self.contact.newTag(_tag, stamp);
            }
        }

    function Author(UnitCard storage _self, address _author)
    public {
        if (_self.init) {
            _self.author = _author; //.notNull( "Author");
            }
        }

    function current(UnitCard storage _self) public view
    returns (string memory _name, string memory _detail, string memory _siren, string memory _siret, string memory _logo, bytes32 _owner, string memory _contact, string memory _tag) {
        TextType text;
        OwnerType own;
        uint256 stamp;

        if (_self.init) {
            (text, _name, stamp, _tag) = _self.name.current();
            (text, _detail, stamp, _tag) = _self.description.current();
            (text, _siren, stamp, _tag) = _self.siren.current();
            (text, _siret, stamp, _tag) = _self.siret.current();
            (text, _logo, stamp, _tag) = _self.logo.current();
            (text, _contact, stamp, _tag) = _self.logo.current();
            (own, _owner, stamp, _tag) = _self.owner.current();
            }
        }

    function previous(UnitCard storage _self, uint256 _rank) public view
    returns (string memory _name, string memory _detail, string memory _siren, string memory _siret, string memory _logo, bytes32 _owner, string memory _tag) {
        TextType text;
        OwnerType own;
        uint256 stamp;

        if (_self.init) {
            (text, _name, stamp, _tag) = _self.name.previous(_rank);
            (text, _detail, stamp, _tag) = _self.description.previous(_rank);
            (text, _siren, stamp, _tag) = _self.siren.previous(_rank);
            (text, _siret, stamp, _tag) = _self.siret.previous(_rank);
            (text, _logo, stamp, _tag) = _self.logo.previous(_rank);
            (own, _owner, stamp, _tag) = _self.owner.previous(_rank);
            }
        }

    function Tags(UnitCard storage _self, uint256 _rank) public view
    returns (string memory _name, string memory _detail, string memory _siren, string memory _siret, string memory _logo, string memory _owner) {
        TextType text;
        string memory value;
        bytes32 id;
        OwnerType own;
        uint256 stamp;

        if (_self.init) {
            (text, value, stamp, _name) = _self.name.previous(_rank);
            (text, value, stamp, _detail) = _self.description.previous(_rank);
            (text, value, stamp, _siren) = _self.siren.previous(_rank);
            (text, value, stamp, _siret) = _self.siret.previous(_rank);
            (text, value, stamp, _logo) = _self.logo.previous(_rank);
            (own, id, stamp, _owner) = _self.owner.previous(_rank);
            }
        }

}