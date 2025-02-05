import { Address } from "viem";
import fs from 'fs';
import { diamondNames, contractSet, facetNames } from "../T2G_Data";
import { contractRecord, diamondCore, Account, NULL_ADDRESS, regex, regex2, regex3 } from "./types";
import { abiItem } from "../interface/types";

export interface wlist {
      [cle: string]: Address; // Ici, 'cle' est le nom variable et 'number' est le type fixe
    }

export interface facetRecord { 
    diamond: Address, 
    facets: wlist
    }

export async function writeLastContractJSONfile( ) {
    let JsonFile = JSON.stringify(contractSet[0]);
    //colorOutput("Save last EUR Contract Record >> ".concat(JSON.stringify(contractSet[0])), "cyan");
    fs.writeFile('./ContractSet.json', JsonFile, (err) => {
        if (err) {
            console.log('Error writing file:', err);
        } else {
            console.log('Successfully wrote file');
            }
        });
    }

/*
export async function readLastFacetJSONfile( facetName: string, diamond: Address ) : Promise<Address> {
    const jsonString = fs.readFileSync('./T2G_Facets.json', 'utf-8');
    const FacetList : facetRecord = JSON.parse(jsonString);
    if (FacetList.diamond != diamond) throw("Bad Record Name for Diamond Address recovery :: ".concat(FacetList.diamond));
    if (!(facetName in FacetList.facets)) throw("Bad Record Name for Facet Address recovery :: ".concat(facetName));
    return FacetList.facets[facetName];
    }
*/

export async function writeLastFacetJSONfile( facets: wlist, diamond: Address ) {
    const jsonString = fs.readFileSync('./T2G_Facets.json', 'utf-8');
    const FacetRecord : facetRecord = JSON.parse(jsonString);
    if (FacetRecord.diamond != diamond) {
        if (Object.keys(facets).length == 0) FacetRecord.diamond = diamond;
        else throw("Bad Record Name for Diamond Address recovery :: ".concat(FacetRecord.diamond));
        }

    for ( const facet of Object.keys(facets)) {
        FacetRecord.facets[<string>facet] = facets[facet];
        }

    let JsonFile = JSON.stringify(FacetRecord);
    fs.writeFile('./T2G_Facets.json', JsonFile, (err) => {
        if (err) {
            console.log('Error writing file:', err);
        } else {
            console.log('Successfully wrote file');
            }
        });
    }

export async function writeLastDiamondJSONfile( ) {
    let JsonFile = JSON.stringify(diamondNames);
    fs.writeFile('./T2G_Root.json', JsonFile, (err) => {
        if (err) {
            console.log('Error writing file:', err);
        } else {
            console.log('Successfully wrote file');
            }
        });
    }
      
export async function readLastDiamondJSONfile() : Promise<boolean> {
    const jsonString = fs.readFileSync('./T2G_Root.json', 'utf-8');
    const DiamondCore : diamondCore = JSON.parse(jsonString);

    if (DiamondCore.Diamond.name != "T2G_root") return false;
    if (!DiamondCore.Diamond.address.match(regex)) return false;

    const jsonDiamond = fs.readFileSync( diamondNames.Diamond.abi.path, 'utf-8');
    const diamondABI : any = JSON.parse(jsonDiamond);
    
    diamondNames.Diamond.address = <Address>DiamondCore.Diamond.address;
    diamondNames.Diamond.abi.file = diamondABI;

    const jsonInit = fs.readFileSync( diamondNames.DiamondInit.abi.path, 'utf-8');
    const initABI : any = JSON.parse(jsonInit);

    diamondNames.DiamondInit.address = <Address>DiamondCore.DiamondInit.address;
    diamondNames.DiamondInit.abi.file = initABI;

    const jsonCut = fs.readFileSync( diamondNames.DiamondCutFacet.abi.path, 'utf-8');
    const cutABI : any = JSON.parse(jsonCut);

    diamondNames.DiamondCutFacet.address = <Address>DiamondCore.DiamondCutFacet.address;
    diamondNames.DiamondCutFacet.abi.file = cutABI;

    const jsonLoupe = fs.readFileSync( diamondNames.DiamondLoupeFacet.abi.path, 'utf-8');
    const loupeABI : any = JSON.parse(jsonLoupe);

    diamondNames.DiamondLoupeFacet.address = <Address>DiamondCore.DiamondLoupeFacet.address;
    diamondNames.DiamondLoupeFacet.abi.file = loupeABI;

    return true;
    }

export async function readLastContractSetJSONfile() : Promise<boolean> {
    const jsonString = fs.readFileSync('./ContractSet.json', 'utf-8');
    const item : contractRecord = JSON.parse(jsonString);

    if (item.name != "EUR") return false;
    
    const jsonEUR = fs.readFileSync(contractSet[0].abi.path, 'utf-8');
    const eurABI : any = JSON.parse(jsonEUR);
    
    contractSet[0].abi.file = <any>eurABI;
    contractSet[0].address = <Address>item.address;

    return true;
    }
    