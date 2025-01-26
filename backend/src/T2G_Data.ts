import { contractRecord, diamondCore, rwRecord, rwType, NULL_ADDRESS, menuRecord, Account } from "./libraries/types";
import { accountRefs, accountType, globalState, setState, addAccount, assignAccounts } from "./logic/states";

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
  { name: "EUR", abi: undefined, address: NULL_ADDRESS, get: 'get_EUR' },
  ]

export const facetNames : contractRecord[] = [
  { name: 'OwnershipFacet', abi: undefined, address: NULL_ADDRESS },
  { name: 'ERC721Facet', abi: undefined, address: NULL_ADDRESS, beacon: 'beacon_ERC721Facet' },
  { name: 'T2G_NektarFacet', abi: undefined, address: NULL_ADDRESS, beacon: 'beacon_NektarFacet', get: 'get_T2G_NektarFacet' },
  { name: 'T2G_PollenFacet', abi: undefined, address: NULL_ADDRESS, beacon: 'beacon_PollenFacet', get: 'get_T2G_PollenFacet', wallet: 'wallet_PollenFacet' },
  { name: 'T2G_HoneyFacet', abi: undefined, address: NULL_ADDRESS, beacon: 'beacon_HoneyFacet', get: 'get_T2G_HoneyFacet', wallet: 'wallet_HoneyFacet' },
  { name: 'T2G_PoolFacet', abi: undefined, address: NULL_ADDRESS, beacon: 'beacon_PoolFacet', get: 'get_T2G_PoolFacet', wallet: "wallet_PoolFacet" },
  { name: 'T2G_EntityFacet', abi: undefined, address: NULL_ADDRESS, beacon: 'beacon_EntityFacet', get: 'get_T2G_EntityFacet' },
  { name: 'T2G_SyndicFacet', abi: undefined, address: NULL_ADDRESS, beacon: 'beacon_SyndicFacet', get: 'get_T2G_SyndicFacet' }
  ]

export const diamondNames : diamondCore = {
    Diamond: { name: "T2G_root", abi: undefined, address: NULL_ADDRESS, beacon: 'beacon_T2G_Root', wallet: "wallet_T2G_root" },
    DiamondCutFacet: { name: "DiamondCutFacet", abi: undefined, address: NULL_ADDRESS },
    DiamondLoupeFacet: { name: "DiamondLoupeFacet", abi: undefined, address: NULL_ADDRESS },
    DiamondInit: { name: "DiamondInit", abi: undefined, address: NULL_ADDRESS },
    }

export const tokenCredential = { 
  name: "Trust2Give Decentralized App", 
  symbol: "T2G",
  seeds: [
    "legal winner thank year wave sausage worth useful legal winner thank yellow"    
  ] 
  } 

/// SMART OBJECT
/// Array to append when a new contract is to be deployed along with the T2G_Data.ts file
/// Please be aware not to use a tag value which is similar to other keyword used. 
/// Nor similar to any function name of the facets to interact with. Make it unique.

export var smart : menuRecord[] = [ 
  { tag: "EUR", contract: "EUR", diamond: Account.AB, args: [], events: undefined },
  { tag: "Honey", contract: "T2G_HoneyFacet", diamond: Account.AA, args: [], events: undefined },
  { tag: "Diamond", contract: "T2G_root", diamond: Account.AA, args: [], events: undefined },
  { tag: "Loupe", contract: "DiamondLoupeFacet", diamond: Account.AA, args: [], events: undefined },
  { tag: "Erc721", contract: "ERC721Facet", diamond: Account.AA, args: [], events: undefined }, 
  { tag: "Pool", contract: "T2G_PoolFacet", diamond: Account.AA, args: [], events: undefined },
  { tag: "Nektar", contract: "T2G_NektarFacet", diamond: Account.AA, args: [], events: undefined }, 
  { tag: "Pollen", contract: "T2G_PollenFacet", diamond: Account.AA, args: [], events: undefined },
  { tag: "Entity", contract: "T2G_EntityFacet", diamond: Account.AA, args: [], events: undefined },
  { tag: "Syndication", contract: "T2G_SyndicFacet",  diamond: Account.AA, args: [], events: undefined } 
  ];

export const smartEntry = ( tag?: string ) : menuRecord | undefined => {
    return <menuRecord | undefined>smart.find((el: menuRecord ) => el.tag == tag);
    }
      

export const encodeInterfaces = {
  T2G_PollenFacet: [
    { function: "getMyPollenList", output: "pollenListABI" }, 
    { function: "pollen", output: "pollenFeaturesABI" }, 
    { function: "rwa", output: "TokenRWASpecificABI" }, 
    { function: "setGHGGain", _data: "TokenRWASpecificABI" },     
    ],
  T2G_EntityFacet: [
    { function: "entity", output: "TokenEntitySpecificABI" }, 
    { function: "setEntity", _data: "TokenEntitySpecificABI" },     
    ],
  T2G_HoneyFacet: [
    { function: "fund", output: "TokenFundSpecificABI" }, 
    { function: "setFund", _data: "TokenFundSpecificABI" },     
    { function: "honey", output: "honeyFeaturesABI" }
    ]
  //T2G_PollenFacet: [{ function: "pollen", _data: "TokenEntitySpecific" }]
  }
  
  export const getWalletAddressFromSmartContract = async () : Promise<accountType[]> => {

    type accKeys = keyof typeof accountRefs;
    const wallet = accountRefs[<accKeys>`@0`].client;

    const account: accountType | accountType[] = <accountType[]>Object.values(accountRefs);

    var list : accountType[] = [];
    var item : accountType;
    var res: Array<any> = [];
    var accounts : accountType[] = Array.isArray(account) ? account : [ account ];
    for ( item of accounts ) {
      res = [ undefined, undefined ]

      const facet : menuRecord = <menuRecord>smart.find((el: menuRecord ) => el.contract == item.name);

      if (facet != undefined) {

          const facets : contractRecord = <contractRecord>facetNames.find((el: contractRecord ) => el.name == item.name);
          
          if (facets != undefined) {
              if (facets.wallet) {
                  //res = await facet.instance.read[<string>facets.wallet]( [], wallet );
              }
          }
          else {
              if (diamondNames.Diamond.name == item.name) {
                  //res = await facet.instance.read[<string>diamondNames.Diamond.wallet]( [], wallet );
                }   
            }   
        }   

      list.push( { 
        name: item.name , 
        address: item.address, 
        wallet: res[0],
        private: res[1],
        balance: item.balance
        });
      }

    return list;        
    }
