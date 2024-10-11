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
/// 

export const diamondNames : diamondCore = {
    Diamond: { name: "T2G_root", address: "0x851356ae760d987e095750cceb3bc6014560891c" },
    DiamondCutFacet: { },
    DiamondLoupeFacet: { },
    DiamondInit: { address: "0x95401dc811bb5740090279ba06cfa8fcf6113778" },
    facetNames: [
      { name: 'OwnershipFacet', beacon: 'beacon_OwnershipFacet' },
      { name: 'ERC721Facet', beacon: 'beacon_ERC721Facet' },
      { name: 'HoneyFacet', action: FacetCutAction.Remove, beacon: 'beacon_HoneyFacet' } 
      ]
    }

/*export const diamondNames : diamondCore = {
      Diamond: { name: "T2G_root", address: "0x9e545e3c0baab3e08cdfd552c960a1050f373042" },
      DiamondCutFacet: { },
      DiamondLoupeFacet: { },
      DiamondInit: { address: "0x1613beb3b2c4f22ee086b2b38c1476a3ce7f78e8" },
      facetNames: [
        { name: 'OwnershipFacet', beacon: 'beacon_OwnershipFacet' },
        { name: 'ERC721Facet', beacon: 'beacon_ERC721Facet' },
        { name: 'HoneyFacet', action: FacetCutAction.Replace, beacon: 'beacon_HoneyFacet' } 
        ]
      }*/
  
export const tokenCredential = { name: "Honey", symbol: "HONEY" } 
