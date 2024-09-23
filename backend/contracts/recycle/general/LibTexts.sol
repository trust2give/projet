// SPDX-License-Identifier: UNLICENCED

/* Librairy LibTexts - Version Remix Compiler 0.8.18 : 02/08/2023 Edition 1.0
 * @title Text written features library for Solidity contracts.
 * @author Franck Dervillez <franck.dervillez.gmail.com>
 *
 * @dev Cette libraririe implémente des fonctions de gestion des données de type text
 */

pragma solidity ^0.8.11;

/* Type ObjectStatus 
 * Utilisé pour les objets de types Entité, Units, Users
 */

enum TextType {
  NONE,       // Etat transitoire par défault à la création d'un objet
  LASTNAME,
  FIRSTNAME,
  EMAIL,
  IMAGE,
  ENTITY,
  DETAIL,
  SIREN,
  SIRET,
  FILE
  }

struct textObj {
  uint256 stamp;
  string tag;
  string content;
  TextType value;
  }

struct TextLog {
  uint256 nb;
  mapping(uint256 => textObj) text;  
  }

/* Données de comptes */

library LibTexts {

    event textChange(TextType _text, string _content, string _tag, uint256 _stamp);

    function beacon_LibTexts() public pure returns (string memory) { return "LibTexts::1.0.0"; }

    function change(TextLog storage _self, TextType _text, string memory _content, string memory _tag, uint256 _stamp) public {
      _self.text[++_self.nb].value = _text;
      _self.text[_self.nb].tag = _tag;
      _self.text[_self.nb].content = _content;
      _self.text[_self.nb].stamp = _stamp;
      emit textChange(_text, _content, _tag, _stamp);
      }

    function newTag(TextLog storage _self, string memory _tag, uint256 _stamp) public {
      _self.text[_self.nb + 1].value = _self.text[_self.nb].value;
      _self.text[_self.nb + 1].content = _self.text[_self.nb].content;
      _self.text[++_self.nb].tag = _tag;
      _self.text[_self.nb].stamp = _stamp;
      }

    function current(TextLog storage _self) public view returns (TextType _text, string memory _content, uint256 _stamp, string memory _tag) {
      return (_self.text[_self.nb].value, _self.text[_self.nb].content, _self.text[_self.nb].stamp, _self.text[_self.nb].tag);
      }

    function previous(TextLog storage _self, uint _rank) public view returns (TextType _text, string memory _content, uint256 _stamp, string memory _tag) {
      return (_self.text[_rank].value, _self.text[_rank].content, _self.text[_rank].stamp, _self.text[_rank].tag);
      }

    function sizeOf(TextLog storage _self) public view returns (uint256 _size) {
      return (_self.nb);
      }
    }