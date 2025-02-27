const hre = require("hardhat");
import { http, Address, getContract, createPublicClient, createWalletClient } from 'viem'
import { mainnet, hardhat } from 'viem/chains'
import express from 'express';
import userRoutes from './routes/userRoutes';
import cors from 'cors';
import { accountRefs, initState, addAccount, clientFormat, globalState, assignAccounts, updateAccountBalance, loadWallets } from "./logic/states";
import { readLastContractSetJSONfile, readLastDiamondJSONfile } from "./libraries/files";
import { contractSet, diamondNames, facetNames, smart, smartEntry, encodeInterfaces } from "./T2G_Data";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3, NULL_HASH } from "./libraries/types";
import { colorOutput } from "./libraries/format";
import fs from 'fs';

const app = express();
const PORT = 8080;
const HOST = '0.0.0.0';

app.use(cors());

app.use(express.json()); // Middleware pour parser le JSON
app.use('/T2G', userRoutes); // Utilisation des routes des utilisateurs

app.listen(PORT, async () => {
      


    console.log("Entering...")
          
    // Initialize globalState variable (Warning : async / wait not possible so wallet / public clients deactivated)
    // to be changed
  initState();

  var initialized : Boolean = false;

  // Initialize wallet/accounts and their balance from hardhat node
  await loadWallets();
  await assignAccounts();

  if (await readLastDiamondJSONfile()) {

    try {                
        colorOutput("Connection to Root >> ".concat( diamondNames.Diamond.address ), "cyan")
                
        const wallet = await globalState.clients.readContract({
            address: diamondNames.Diamond.address,
            abi: diamondNames.Diamond.abi.file.abi,
            functionName: 'wallet_T2G_root',
            args: []
        })
        
        colorOutput("Fectch Stable Coint Wallet@ >> ".concat( wallet[0] ), "cyan")

        initialized = await addAccount( 
            10, 
            diamondNames.Diamond.name, 
            diamondNames.Diamond.address, 
            <Array<any>>wallet
            );

        colorOutput("Root Diamont Initialized >> ".concat( (initialized) ? "OK" : "NOK" ), "cyan")
        }
    catch (error) {
        console.error(">> Error :: No T2G_Root initialized @ %s", diamondNames.Diamond.address, error)
        }

    if (await readLastContractSetJSONfile()) {

        try {
            colorOutput("Connection to Eur StableCoin >> ".concat( contractSet[0].address ), "cyan");

            await addAccount( 
                11, 
                contractSet[0].name, 
                contractSet[0].address, 
                [] 
                );
            }
        catch (error) {
            console.error(">> Error :: No StableCoin Contract initialized @ %s ", contractSet[0].address, error)            
            }
        }
    
    if (initialized) {
        var rank = 12;
        
        for (const facet of facetNames) {        

            var get : Address = NULL_ADDRESS;
            var wallet : any[] = [ NULL_ADDRESS, NULL_HASH ];

            try {    
                const jsonFacet = fs.readFileSync( 
                    facet.abi.path, 
                    'utf-8' 
                    );

                const facetABI : any = JSON.parse(jsonFacet);

                try {
                    const get : Address = <Address>await globalState.clients.readContract({
                        address: diamondNames.Diamond.address,
                        abi: facetABI.abi,
                        functionName: <string>facet.get,
                        args: []
                        });
    
                    console.log( "Facet >> %s (%s)", facet.name, get)    
                    }
                catch (error) {
                    console.error(">> No Get Function initialized %s, @ %s", facet.name, diamondNames.Diamond.address)
                    }
                    
                try {
                    const wallet : any[] = <any[]>await globalState.clients.readContract({
                        address: diamondNames.Diamond.address,
                        abi: facetABI.abi,
                        functionName: <string>facet.wallet,
                        args: []
                        });
    
                    console.log( "Facet >> %s (xallet %s)", facet.name, wallet[0])

                    }
                catch (error) {
                    console.error(">> No Wallet Function initialized %s, @ %s", facet.name, diamondNames.Diamond.address)
                    }

                }
            catch (error) {
                console.error(">> Error :: No Facet Contract initialized %s, @ %s", facet.name, diamondNames.Diamond.address)
                }
    
            await addAccount( 
                rank, 
                facet.name, 
                get, 
                wallet 
                );

            rank++;
            }
        } 
    }

  console.log(`Serveur en écoute sur le port ${PORT}`);
});
