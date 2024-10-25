import { FacetCutAction } from "./utils/diamond";
import { diamondCore } from "./deploy";

/// Variable globale qui représente l'état des actions de déploiement à
/// réaliser pour réaliser la mise à jour de l'architecture ERC2535
/// de la dApp Trust2Give
/// Combinaisons possibles :
/// Diamond : name: <null> || "nom_contract" => Si le nom de Smart Contract Diamond est remplacé par un autre spécifique
///   - action: FacetCutAction.Add && address: <null> => Création d'un nouveau Diamond
///   - action: <null> && address: "0xabc..."  => Référencement d'un Diamond déployé
/// DiamondCutFacet || DiamondCutFacet : contract déployés si Diamond déployé et créés quand Diamond recréé
///   - name: <null> || "nom_contract" => le nom de Smart Contract Diamond est remplacé par un autre spécifique
/// DiamondInit: address: <null> || "0xabc..."  => Référencement d'un DiamondInit Déployé 
///   Adresse à mettre à jour manuellement, à chaque nouveau déploiement de diamond
/// facetNames: [] liste des smartcontracts du diamond qui consituent la business logique
///   Pour chaque facet:
///   - name: <null> || "nom_contract" => le nom de Smart Contract de la facet
///   - action: FacetCutAction.Add || FacetCutAction.Replace || FacetCutAction.Remove || <null>
///   - argInit : boolean qui indique si le constructeur attend aucun input (false) ou l'adresse du T2G_Root (true)
///   - addReader : boolen qui indique si le contract contient la méthode get_<Nom Contrat> pour avoir l'addresse propres du SC
///  
/*
export const diamondNames : diamondCore = {
    Stablecoin: { name: "EUR", action: FacetCutAction.Add, address: "" },
    Diamond: { name: "T2G_root", action: FacetCutAction.Add, address: "" },
    DiamondCutFacet: { },
    DiamondLoupeFacet: { },
    DiamondInit: { address: "" },
    facetNames: [
      { name: 'OwnershipFacet', argInit: false, action: FacetCutAction.Add, beacon: 'beacon_OwnershipFacet' },
      { name: 'ERC721Facet', argInit: false, action: FacetCutAction.Add, beacon: 'beacon_ERC721Facet' },
      { name: 'T2G_NektarFacet', argInit: true, action: FacetCutAction.Add, addReader: true, beacon: 'beacon_NektarFacet' },
      { name: 'T2G_PollenFacet', argInit: true, action: FacetCutAction.Add, addReader: true, beacon: 'beacon_PollenFacet' },
      { name: 'T2G_HoneyFacet', argInit: true, action: FacetCutAction.Add, addReader: true, beacon: 'beacon_HoneyFacet' },
      { name: 'T2G_PoolFacet', argInit: true, action: FacetCutAction.Add, addReader: true, beacon: 'beacon_PoolFacet' }
      ]
    }

    */
export const diamondNames : diamondCore = {
      Stablecoin: { name: "EUR", address: "0x5fbdb2315678afecb367f032d93f642f64180aa3" },
      Diamond: { name: "T2G_root", address: "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0" },
      DiamondCutFacet: { },
      DiamondLoupeFacet: { },
      DiamondInit: { address: "0xdc64a140aa3e981100a9beca4e685f962f0cf6c9" },
      facetNames: [
      { name: 'OwnershipFacet', argInit: false, beacon: 'beacon_OwnershipFacet' },
      { name: 'ERC721Facet', argInit: false, beacon: 'beacon_ERC721Facet' },
      { name: 'T2G_NektarFacet', argInit: true, addReader: true, beacon: 'beacon_NektarFacet' },
      { name: 'T2G_PollenFacet', argInit: true, addReader: true, beacon: 'beacon_PollenFacet' },
      { name: 'T2G_HoneyFacet', argInit: true, action: FacetCutAction.Replace, addReader: true, beacon: 'beacon_HoneyFacet' },
      { name: 'T2G_PoolFacet', argInit: true, action: FacetCutAction.Replace, addReader: true, beacon: 'beacon_PoolFacet' }
        ]
      }

      //0x6e0a5725dd4071e46356bd974e13f35dbf9ef367
export const tokenCredential = { name: "Trust2Give Decentralized App", symbol: "T2G" } 
