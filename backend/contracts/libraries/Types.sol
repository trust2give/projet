// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.0;

library T2GTypes {

/* UserRight Flags
 * Defines the profils of users around the T2G application
 */

 uint8 constant R_VIEWS = 1;
 uint8 constant R_GIVES = 2;
 uint8 constant R_OWNS = 4;
 uint8 constant R_FARMS = 8;
 uint8 constant R_GRANTS = 16;
 uint8 constant R_COLLECTS = 32;
 uint8 constant R_ADMINS = 64;

enum countries {
  NONE,
  FRANCE,
  GERMANY,
  BELGIUM,
  SWITZERLAND,
  ITALY,
  SPAIN,
  PORTUGAL,
  GREATBRITAIN,
  SCOTTLAND,
  IRELAND,
  NETHERLAND,
  LUXEMBURG,
  POLAND,
  DENMARK,
  SWEDEN,
  NORWAY,
  ISLAND,
  FINLAND,
  USA,
  BRAZIL,
  OTHERS
}


/* Type CoinUnit 
 * Utilisé pour les unités monétaires pour les valorisation des tokens POLLEN, NEKTAR, CELL et HONEY
 * et pour les autres usages en général
 */

enum CoinUnit {
  NONE,
  T2GSC,
  EURO,
  DOLLAR,
  SWISSFRANC,
  STERLINGPOUND,
  YEN,
  YUAN,
  USDC,
  USDT,
  EURC,
  SUI
}

/* Type UnitSize
 * Type utilisé pour la caractérisation la taille des unités dans la ruche
 */ 

enum sizeUnit {
  NONE,
  KILO,
  TON,
  KTON,
  MTON
}


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

/* Type EntityType
 * Type utilisé pour la caractérisation des entités autour de la ruche
 */ 
enum EntityType {
  NONE,     // Pas de type par défaul
  PERSON,   // Entité de type Personne Physique individuelle
  ENTITY,   // Entité de type Personne Morale individuelle
  GROUP,    // Entité de type Groupe de société
  NETWORK   // Entité de type Association / réseau de d"entités indépendantes
}

/* Type GainType
 * Liste les axes de réduction d'émission selon le modèle SBTi
 * et les recommandations des principes du NetZero Initiative
 */
enum GainType {
  NONE,
  REDUCTION,
  SEQUESTRATION,
  EVIT_PRODUIT,
  EVIT_CHAINE,
  EVIT_COMPENSATION
}

/* Type UnitType
 * Type utilisé pour la caractérisation la taille des unités dans la ruche
 */ 
enum UnitType {
  NONE,   // Pas de type par défaul
  ENTREPRISE,
  ASSOCIATION,
  FONDATION,
  PLATEFORME,
  COLLECTIVITE,
  EPICS,
  ETAT
  }

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
enum BusinessSector { 
  NONE, 
  TRANSPORT, 
  AUTOMOTIVE, 
  AEROSPACE, 
  SERVICES, 
  SOFTWARE, 
  ITINDUSTRY, 
  HIGHTECH, 
  LUXURY, 
  BUILDINGS, 
  SUPPLYCHAIN, 
  FOOD, 
  HEALTHCARE 
  }

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



bool constant YES = true;
bool constant NO = false;

// Librairie implémentant un journal de traçabilité des enregistrements
 
uint256 constant MAX_INT = 2**256 - 1;
uint8 constant MAX_ADMIN = 10;
uint8 constant MAX_MANAGER = 10;
uint8 constant MAX_POLSTAT = 5; //uint(type(PollenStatus).max) + 1; // 5;
uint8 constant MAX_USRROLE = 8; //uint(type(Profile).max) + 1; // 7;

  }