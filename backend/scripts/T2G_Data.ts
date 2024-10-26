import { FacetCutAction } from "./utils/diamond";
import { contractRecord, diamondCore, NULL_ADDRESS } from "./T2G_utils";

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
  
export const contractSet : contractRecord[] = [
  { name: "EUR", address: "0x5fbdb2315678afecb367f032d93f642f64180aa3", argInit: false, addReader: false, beacon: false },
  ]

export const facetNames : contractRecord[] = [
  { name: 'OwnershipFacet', address: NULL_ADDRESS, argInit: false, addReader: false, beacon: false },
  { name: 'ERC721Facet', address: NULL_ADDRESS, argInit: false, addReader: false, beacon: 'beacon_ERC721Facet' },
  { name: 'T2G_NektarFacet', address: NULL_ADDRESS, argInit: true, addReader: true, beacon: 'beacon_NektarFacet' },
  { name: 'T2G_PollenFacet', address: NULL_ADDRESS, argInit: true, addReader: true, beacon: 'beacon_PollenFacet' },
  { name: 'T2G_HoneyFacet', address: NULL_ADDRESS, argInit: true, addReader: true, beacon: 'beacon_HoneyFacet' },
  { name: 'T2G_PoolFacet', address: NULL_ADDRESS, argInit: true, addReader: true, beacon: 'beacon_PoolFacet' },
  { name: 'T2G_SyndicFacet', address: NULL_ADDRESS, argInit: true, addReader: true, beacon: 'beacon_SyndicFacet' }
  ]

export const diamondNames : diamondCore = {
    Diamond: { name: "T2G_root", address: "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0", argInit: false, addReader: false, beacon: 'beacon_T2G_Root' },
    DiamondCutFacet: { name: "DiamondCutFacet", address: NULL_ADDRESS, argInit: false, addReader: false, beacon: false },
    DiamondLoupeFacet: { name: "DiamondLoupeFacet", address: NULL_ADDRESS, argInit: false, addReader: false, beacon: false },
    DiamondInit: { name: "DiamondInit", address: "0xdc64a140aa3e981100a9beca4e685f962f0cf6c9", argInit: false, addReader: false, beacon: false },
    }

export const tokenCredential = { name: "Trust2Give Decentralized App", symbol: "T2G" } 
