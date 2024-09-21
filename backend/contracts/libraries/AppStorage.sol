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
