const hre = require("hardhat");
import { Address, encodeAbiParameters, decodeAbiParameters } from 'viem'
import express from 'express';
import userRoutes from './routes/userRoutes';
import cors from 'cors';
import { accountRefs, initState, addAccount, accountType, globalState, assignAccounts, updateAccountBalance, loadWallets } from "./logic/states";
import { readLastContractSetJSONfile, readLastDiamondJSONfile } from "./libraries/files";
import { contractSet, diamondNames, facetNames, smart, smartEntry, encodeInterfaces } from "./T2G_Data";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "./libraries/types";
import { DeployContracts } from './logic/DeployContracts';
import { colorOutput } from "./libraries/format";

const app = express();
const PORT = 8080;
const HOST = '0.0.0.0';

app.use(cors());

app.use(express.json()); // Middleware pour parser le JSON
app.use('/T2G', userRoutes); // Utilisation des routes des utilisateurs

app.listen(PORT, async () => {
  
    // Initialize globalState variable (Warning : async / wait not possible so wallet / public clients deactivated)
    // to be changed
  initState();

  var initialized : Boolean = false;
  type accKeys = keyof typeof accountRefs;

  // Initialize wallet/accounts and their balance from hardhat node
  await loadWallets();
  await assignAccounts();
  await updateAccountBalance();

  if (await readLastDiamondJSONfile()) {

    try {                
        const getRoot = await hre.viem.getContractAt( 
            diamondNames.Diamond.name, 
            diamondNames.Diamond.address
        );

        colorOutput("Connection to Root >> ", "cyan")

        const wallet : any[] = await getRoot.read.wallet_T2G_root( 
            [], 
            { wallet: globalState.wallets[0] } 
            ) //root 

        colorOutput("Fectch Stable Coint Wallet@ >> ".concat(wallet[0], " ", wallet[1]), "cyan")

        initialized = await addAccount( 
            10, 
            diamondNames.Diamond.name, 
            diamondNames.Diamond.address, 
            wallet
            );        

        colorOutput("Root Diamont Initialized >> ".concat( (initialized) ? "OK" : "NOK" ), "cyan")
        }
    catch (error) {
        console.error(">> Error :: No T2G_Root initialized @ %s", diamondNames.Diamond.address, error)

        await DeployContracts( "Diamond Add T2G_Root");
        }

    if (await readLastContractSetJSONfile()) {
        try {
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
        type AccountKeys = keyof typeof Account;
        const indice = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (const facet of facetNames) {
            if (smart.findIndex((item) => item.contract == facet.name) > -1) {

                const getAddr = await hre.viem.getContractAt( 
                    facet.name, 
                    diamondNames.Diamond.address
                    );

                try {    

                    const get : Address = (facet.get) ? await getAddr.read[<string>facet.get]( 
                        [], 
                        accountRefs[<accKeys>`@0`].client 
                        ) : NULL_ADDRESS;                
                                            
                    await addAccount( 
                        rank, 
                        facet.name, 
                        get, 
                        (facet.wallet) ? await getAddr.read[<string>facet.wallet]( 
                            [], 
                            accountRefs[<accKeys>`@0`].client 
                            ) : [] 
                        );
    
                    rank++;
                    }
                catch (error) {
                    console.error(">> Error :: No Facet Contract initialized %s, @ %s", facet.name, diamondNames.Diamond.address)
                   }
                }
            }
        } 
    }

  
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
