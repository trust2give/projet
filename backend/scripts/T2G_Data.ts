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
    Diamond: { name: "T2G_root", address: "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512" },
    DiamondCutFacet: { },
    DiamondLoupeFacet: { },
    DiamondInit: { address: "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9" },
    facetNames: [
      { name: 'OwnershipFacet', beacon: 'beacon_OwnershipFacet' },
      { name: 'ERC721Facet', beacon: 'beacon_ERC721Facet' },
      { name: 'MintFacet', beacon: 'beacon_MintFacet', action: FacetCutAction.Replace } 
      ]
    }

export const tokenCredential = { name: "Honey", symbol: "HONEY" } 
