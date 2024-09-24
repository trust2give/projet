// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.0;

//import "@openzeppelin/contracts/drafts/Counters.sol";

//import "./utils/LibDate.sol";
//import "./pollen/LibPollenData.sol";
//import "./nektar/LibNektarData.sol";
//import "./cell/LibCellData.sol";
//import "./company/LibUnits.sol";
//import "./user/LibUsers.sol";
//import "./company/LibEntities.sol";
//import "./LibTarget.sol";

/* Type UnitSize
 * Type utilisé pour la caractérisation la taille des unités dans la ruche
 */ 

enum UnitSize {
  NONE,   // Pas de type par défaul
  SOLE,   // Taille individuelle
  TPE,    // Taille < 10 personnes
  PME,    // Taille < 250 personnes
  ETI,    // Taille < 1000 personnes
  GE      // Taille > 1000 personnes
  }

/* Type GainScope
 * Liste des 23 axes d'émission de GES définis dans les Bilans Carbones
 */

uint8 constant MAX_GAINSCOPE = 24;

enum GainScope {
  NONE,
  S1_FIXE,
  S1_MOBILE,
  S1_PROCESS,
  S1_FUGITIVE,
  S1_BIOMASSE,
  S2_ELECTRICITY,
  S2_HEATCOLD,
  S3_UPSTREAMNRJ,
  S3_RAWPURCHASE,
  S3_AMMORTIZATION,
  S3_WASTES,
  S3_UPSTREAMSUPPLY,
  S3_TRAVELS,
  S3_UPSTREAMLEASING,
  S3_TBD2,
  S3_VISITORS,
  S3_DOWNSTREAMSUPPLY,
  S3_SALES,
  S3_ENDOFLIFE,
  S3_DOWNSTREAMFRANCHISE,
  S3_DOWNSTREAMLEASING,
  S3_TBD3,
  S3_TBD4 }
  
/* ENUM Source de gain possibles
 * Classification des gains
 */

enum GainSource { NONE, PROCESS, PRODUCT, SUPPLIER, PROVIDER, EQUIPMENT, CONSUMPTION, TRANSPORT, OTHER }

/* Type BusSector
 * Type utilisé pour la caractérisation du secteur d'activité de l'unité
 */ 
enum BusSector { NONE, TRANSPORT, AUTOMOTIVE, AEROSPACE, SERVICES, SOFTWARE, ITINDUSTRY, HIGHTECH, LUXURY, BUILDINGS, SUPPLYCHAIN, FOOD, HEALTHCARE }

/* Type PeriodType
 * Définit les valeurs de période pour la configuration des trjectoires et des quotas
 * NONE : Valeur par défaut à l'initialisation de la variable
 * MONTH : Période mensuelle
 * QUARTER: Période trimestrielle
 * SEMESTER : Période semestrielle
 * YEAR : Période annuelle
 */

enum PeriodType { NONE, MONTH, QUARTER, SEMESTER, YEAR }

/* Type Currency 
 * Utilisé pour les unités monétaires pour les valorisation des tokens POLLEN, NEKTAR, CELL et HONEY
 * et pour les autres usages en général
 */

enum Currency { NONE, EURO, DOLLAR, SWISSFRANC, STERLINGPOUND, YEN, YUAN }

bool constant YES = true;
bool constant NO = false;

// Librairie implémentant un journal de traçabilité des enregistrements
 
uint256 constant MAX_INT = 2**256 - 1;
uint8 constant MAX_ADMIN = 10;
uint8 constant MAX_MANAGER = 10;
uint8 constant MAX_POLSTAT = 5; //uint(type(PollenStatus).max) + 1; // 5;
uint8 constant MAX_USRROLE = 8; //uint(type(Profile).max) + 1; // 7;

struct AppStorage {
  address owner;
  uint256 seed;   // Calcul de façon unique les identifiants
  //TimeStamp chronos;

  // =============================================
  // DataStorage related to user & accounts rights
  // =============================================

//  EntityStorage entities;
//  UnitStorage units;
//  UserStorage users; 

  // ===================================
  // DataStorage related to Pollen Stocks
  // ===================================

//  PollenStorage pollens;

  // ===================================
  // DataStorage related to Nektar Stocks
  // ===================================

//  NektarStorage nektars;

  // ===================================
  // DataStorage related to Cells Stocks
  // ===================================

//  CellStorage cells;

  // ===================================
  // DataStorage related to Honey Stocks
  // ===================================

  }

  library LibStorage {

    function appStorage()
      internal
      pure
      returns (AppStorage storage ds) {
        assembly { ds.slot := 0 }
      }

  }
