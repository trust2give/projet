// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.11;

// Librairie implémentant un journal de traçabilité des enregistrements

import "./AppStorage.sol";
import "./utils/LibDate.sol";
import "./LibDiamond.sol";
import "./general/LibBaseCard.sol";
import "./general/LibEnums.sol";

/* Partie de définition des structures de données liées aux quotas et trajectoires 
 *
 */

/* Type PeriodType
 * Définit les valeurs de période pour la configuration des trjectoires et des quotas
 * NONE : Valeur par défaut à l'initialisation de la variable
 * MONTH : Période mensuelle
 * QUARTER: Période trimestrielle
 * SEMESTER : Période semestrielle
 * YEAR : Période annuelle
 */

enum PeriodType {
  NONE,
  MONTH,
  QUARTER,
  SEMESTER,
  YEAR
  }

/* Type TargetVersion
 * Structure qui décrit le contrat de trajectoire de base d'une entité E1
 */

struct TargetVersion {
  /* Identifiant unique
   *
   */
  BaseCard  id;
  // nature de la période considérée pour la trajectoire
  PeriodType unit;
  // Valeur qui indique le nombre de périodes dans l'élongation calendaire de la trajectoire
  uint8 periods;        
  // Valeur indiquant le quota total maximum d'émission de GES cible pour l'entité
  // C'est le montant de cumulé de toutes les émissions périodiaues, qui représente l'objectif
  // global à atteindre
  uint256 quota;
  // Valeur indiquant le gain total maximum d'émission de GES par rapport à la trajectoire As-Usual
  uint256 gain;
  // Valeurs d'émission cible à chaque période, sur la base de la trajectoire cible
  // period[0] correspond à la Valeur d'émission du bilan carbone de la période 0, 
  // qui sert de calcul aux émissions périodiques et au quota global
  uint256[] period;
  }
// stamp(string) est au format "DYYYYMMDDHHMMSS"

library LibTarget {

  using LibDate for TimeStamp;
  using LibBaseCard for BaseCard;

  event TargetCreated(bytes32 _cpt);
  event TargetChanged(bytes32 _cpt, uint256 _id, uint256 _time);

  function Stamp()
    internal
    returns (TimeStamp memory) {
      AppStorage storage s = LibStorage.appStorage();
      s.chronos.timestamp = block.timestamp;
      s.chronos.parseTimestamp();
      return s.chronos;
      }

  function ContainsTarget(
    bytes32 _cpt)
    public view
    returns (bool) {
      AppStorage storage s = LibStorage.appStorage();
      //return s.isTrajectory[_cpt];
      }

  function initTarget(
    bytes32 _cpt,
    TargetVersion memory _target )
    public {
      AppStorage storage s = LibStorage.appStorage();

      if (!ContainsTarget(_cpt)) {
        require((_target.periods > 0), "Empty trajectory");
        //require((_target.target.length > 0), "Empty trajectory");
        //_target.created = LibTarget.Stamp();

        //s.trajectory[_cpt].periods = _target.periods;
        //s.trajectory[_cpt].unit = _target.unit;
        //s.trajectory[_cpt].counts = 1;
        //s.trajectory[_cpt].targets[s.trajectory[_cpt].counts] = _target;

        //s.isTrajectory[_cpt] = true;

        emit TargetCreated(_cpt);
        }
      }

  // Fonction d'initialisation des informations optionnelles

  function newTarget(
    bytes32 _cpt,
    TargetVersion memory _target )
    public {
      AppStorage storage s = LibStorage.appStorage();

      if (ContainsTarget(_cpt)) {
        require((_target.periods > 0), "Empty trajectory");
        //require((_target.target.length > 0), "Empty trajectory");
        //_target.created = LibTarget.Stamp();

        //s.trajectory[_cpt].counts++;
        //s.trajectory[_cpt].targets[s.trajectory[_cpt].counts] = _target;

        //emit TargetChanged(_cpt, s.trajectory[_cpt].counts, _target.created.timestamp);
        }
      }

  function getActiveTarget(
    bytes32 _cpt)
    public view
    returns (TargetVersion memory _result) {
      AppStorage storage s = LibStorage.appStorage();
      if (ContainsTarget(_cpt)) {
        //_result = s.trajectory[_cpt].targets[s.trajectory[_cpt].counts];
      }
    }

  function getNthTarget(
    bytes32 _cpt,
    uint256 _id)
    public view
    returns (TargetVersion memory _result) {
      AppStorage storage s = LibStorage.appStorage();
      if (ContainsTarget(_cpt)) {
 //       require((_id > s.trajectory[_cpt].counts), "Invalid Index");
//        _result = s.trajectory[_cpt].targets[_id];
        }
    }

}
