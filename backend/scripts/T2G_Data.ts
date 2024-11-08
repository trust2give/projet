import { contractRecord, diamondCore, NULL_ADDRESS, menuRecord, Account } from "./T2G_utils";
import { TokenEntitySpecific } from "./T2G_Types";

/// Variables globales qui représentent l'état des smart contracts en déploiement à
/// réaliser pour réaliser la mise à jour de l'architecture ERC2535 de la dApp Trust2Give
/// 
/// Diamond : name: "nom_contract" => Si le nom de Smart Contract Diamond est remplacé par un autre spécifique
/// DiamondLoupeFacet || DiamondCutFacet : contract déployés si Diamond déployé et créés quand Diamond recréé
/// DiamondInit: Référencement d'un DiamondInit Déployé 
/// facetNames: [] liste des smartcontracts du diamond qui consituent la business logique
///   Pour chaque facet / contract
///   - name: "nom_contract" => le nom de Smart Contract de la facet
///   - argInit : boolean qui indique si le constructeur attend aucun input (false) ou l'adresse du T2G_Root (true)
///   - addReader : boolen qui indique si le contract contient la méthode get_<Nom Contrat> pour avoir l'addresse propres du SC
///   - beacon: false si le smart contract ne contient pas de fonction beacon ou le nom de cette fonction
///  ContractSet: [] liste des smart contracts mock-up. Pour le moment restreint à un simulateur de StableCoin ERC20 pour le POC

/// En cas de modification dans la structure du Diamant ERC2535 (ajout de facet), il faut:
/// 1. compléter la liste de facteNames avec le nouveau contrat (ci-dessous)
/// 2. dupliquer un script / créer un script "T2G_Interact<Contrat>.ts" à partir d'un des contract existants 
/// 3. Créer un tableau rw<Contract>List qui représente la description des fonctions du smart contract 
/// 4. Mettre à jour la variable du script Menu.ts : < smart : menuRecord[] > et ajouter la référence au nouveau contrat et l'appel à la fonction du script

/// ATTENTION : Deux fichiers JSON sont créés et à ne pas effacer : ContractSet.JSON et T2G_Root.JSON dans le dossier de script
/// Ces deux fichiers sauvegardent les contenus des structures ContractSet & DiamondNames lors des opérations de déploiement
/// Pour retrouver les addresses des derniers contracts déployés T2G_Root et EUR (Contract StableCoin Mock-up)

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
    Diamond: { name: "T2G_root", address: NULL_ADDRESS, argInit: false, addReader: false, beacon: 'beacon_T2G_Root' },
    DiamondCutFacet: { name: "DiamondCutFacet", address: NULL_ADDRESS, argInit: false, addReader: false, beacon: false },
    DiamondLoupeFacet: { name: "DiamondLoupeFacet", address: NULL_ADDRESS, argInit: false, addReader: false, beacon: false },
    DiamondInit: { name: "DiamondInit", address: NULL_ADDRESS, argInit: false, addReader: false, beacon: false },
    }

export const tokenCredential = { name: "Trust2Give Decentralized App", symbol: "T2G" } 

/// SMART OBJECT
/// Array to append when a new contract is to be deployed along with the T2G_Data.ts file
/// Please be aware not to use a tag value which is similar to other keyword used. 
/// Nor similar to any function name of the facets to interact with. Make it unique.

export var smart : menuRecord[] = [ 
  //{ tag: "Deploy", contract: undefined, diamond: undefined, args: [], instance: undefined, events: undefined }, 
  { tag: "EUR", contract: "EUR", diamond: Account.AE, args: [], instance: undefined, events: undefined },
  { tag: "Honey", contract: "T2G_HoneyFacet", diamond: Account.AA, args: [], instance: undefined, events: undefined },
  { tag: "Diamond", contract: "T2G_root", diamond: Account.AA, args: [], instance: undefined, events: undefined },
  { tag: "Loupe", contract: "DiamondLoupeFacet", diamond: Account.AA, args: [], instance: undefined, events: undefined },
  { tag: "Erc721", contract: "ERC721Facet", diamond: Account.AA, args: [], instance: undefined, events: undefined }, 
  { tag: "Pool", contract: "T2G_PoolFacet", diamond: Account.AA, args: [], instance: undefined, events: undefined },
  { tag: "Nektar", contract: "T2G_NektarFacet", diamond: Account.AA, args: [], instance: undefined, events: undefined }, 
  { tag: "Pollen", contract: "T2G_PollenFacet", diamond: Account.AA, args: [], instance: undefined, events: undefined },
  { tag: "Syndication", contract: "T2G_SyndicFacet",  diamond: Account.AA, args: [], instance: undefined, events: undefined } 
  ];

export const encodeInterfaces = {
  T2G_PollenFacet: [
    { function: "pollen", output: "pollenFeaturesABI" }, 
    { function: "getMyPollenList", output: "pollenListABI" }, 
    { function: "updatePollenRwa", _data: "TokenRWASpecificABI" }, 
    { function: "updatePollenEntity", _data: "TokenEntitySpecificABI" }
    ],
  T2G_HoneyFacet: [{ function: "honey", output: "honeyFeaturesABI" }]
  //T2G_PollenFacet: [{ function: "pollen", _data: "TokenEntitySpecific" }]
  }
  