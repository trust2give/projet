import { Address } from "viem";
import fs from 'fs';
import { diamondNames, contractSet } from "../T2G_Data";
import { contractRecord, diamondCore, Account, NULL_ADDRESS, regex, regex2, regex3 } from "./types";


export interface facetRecord { 
    diamond: Address, 
    facets: Object
    }

export async function readLastContractSetJSONfile() : Promise<contractRecord[]> {
    const jsonString = fs.readFileSync('./scripts/ContractSet.json', 'utf-8');
    const item : contractRecord = JSON.parse(jsonString);
    if (item.name != "EUR") throw("Bad Record Name for EUR StableCoin Address recovery :: ".concat(item.name));
    //colorOutput("Recall Last EUR Smart Contract Record >> ".concat(JSON.stringify(item)), "cyan");
    contractSet[0] = <contractRecord>item;
    return contractSet;
    }

export async function writeLastContractJSONfile( ) {
    let JsonFile = JSON.stringify(contractSet[0]);
    //colorOutput("Save last EUR Contract Record >> ".concat(JSON.stringify(contractSet[0])), "cyan");
    fs.writeFile('./scripts/ContractSet.json', JsonFile, (err) => {
        if (err) {
            console.log('Error writing file:', err);
        } else {
            console.log('Successfully wrote file');
            }
        });
    }

export async function readLastFacetJSONfile( facetName: string, diamond: Address ) : Promise<Address> {
    const jsonString = fs.readFileSync('./scripts/T2G_Facets.json', 'utf-8');
    const FacetList : facetRecord = JSON.parse(jsonString);
    if (FacetList.diamond != diamond) throw("Bad Record Name for Diamond Address recovery :: ".concat(FacetList.diamond));
    if (!(facetName in FacetList.facets)) throw("Bad Record Name for Facet Address recovery :: ".concat(facetName));
    return FacetList.facets[facetName];
    }

export async function writeLastFacetJSONfile( facets: Object, diamond: Address ) {
    const jsonString = fs.readFileSync('./scripts/T2G_Facets.json', 'utf-8');
    const FacetRecord : facetRecord = JSON.parse(jsonString);
    if (FacetRecord.diamond != diamond) {
        if (Object.keys(facets).length == 0) FacetRecord.diamond = diamond;
        else throw("Bad Record Name for Diamond Address recovery :: ".concat(FacetRecord.diamond));
        }

    for ( const facet of Object.keys(facets)) {
        FacetRecord.facets[facet] = facets[facet];
        }

    let JsonFile = JSON.stringify(FacetRecord);
    fs.writeFile('./scripts/T2G_Facets.json', JsonFile, (err) => {
        if (err) {
            console.log('Error writing file:', err);
        } else {
            console.log('Successfully wrote file');
            }
        });
    }

export async function writeLastDiamondJSONfile( ) {
    let JsonFile = JSON.stringify(diamondNames);
    fs.writeFile('./scripts/T2G_Root.json', JsonFile, (err) => {
        if (err) {
            console.log('Error writing file:', err);
        } else {
            console.log('Successfully wrote file');
            }
        });
    }
      
export async function readLastDiamondJSONfile() {
    const jsonString = fs.readFileSync('./scripts/T2G_Root.json', 'utf-8');
    const DiamondCore : diamondCore = JSON.parse(jsonString);
    if (DiamondCore.Diamond.name != "T2G_root") throw("Bad Record Name for T2G_Root Address recovery :: ".concat(DiamondCore.Diamond.name));
    diamondNames.Diamond = <contractRecord>DiamondCore.Diamond;
    diamondNames.DiamondInit = <contractRecord>DiamondCore.DiamondInit;
    diamondNames.DiamondCutFacet = <contractRecord>DiamondCore.DiamondCutFacet;
    diamondNames.DiamondLoupeFacet = <contractRecord>DiamondCore.DiamondLoupeFacet;
    }
