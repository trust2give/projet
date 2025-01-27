import { Address } from "viem";
import fs from 'fs';
import { diamondNames, contractSet } from "../T2G_Data";
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
    
    diamondNames.Diamond = <contractRecord>DiamondCore.Diamond;
    diamondNames.Diamond.abi.file = diamondABI.abi;
    
    diamondNames.DiamondInit = <contractRecord>DiamondCore.DiamondInit;

    diamondNames.DiamondCutFacet = <contractRecord>DiamondCore.DiamondCutFacet;

    diamondNames.DiamondLoupeFacet = <contractRecord>DiamondCore.DiamondLoupeFacet;

    return true;
    }

export async function readLastContractSetJSONfile() : Promise<boolean> {
    const jsonString = fs.readFileSync('./ContractSet.json', 'utf-8');
    const item : contractRecord = JSON.parse(jsonString);

    if (item.name != "EUR") return false;
    
    const jsonEUR = fs.readFileSync(contractSet[0].abi.path, 'utf-8');
    const eurABI : any = JSON.parse(jsonEUR);

    console.log( "__________", eurABI );
    console.log( contractSet[0].abi );
    
    contractSet[0] = <contractRecord>item;
    contractSet[0].abi.file = eurABI.abi;

    return true;
    }
    