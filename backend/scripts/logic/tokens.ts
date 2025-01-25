const hre = require("hardhat");
import { Address, decodeAbiParameters } from 'viem'
import { smart, encodeInterfaces } from "../T2G_Data";
import { dataDecodeABI, abiData, typeRouteArgs, honeyFeatures, pollenFeatures, Typeoftoken, Statusoftoken } from "../interface/types";
import { colorOutput, displayAccountTable } from "../libraries/format";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";
import { accountRefs, globalState, setState, addAccount, account, updateAccountBalance, assignAccounts } from "../logic/states";
import { setrwRecordFromSmart } from "../logic/instances";
import { InteractWithContracts } from "../InteractWithContracts";

export const showTokens = async () => {
    
    type accKeys = keyof typeof accountRefs;

    const func0: rwRecord = await setrwRecordFromSmart( 
        "totalSupply", 
        "Erc721" 
        );
        
    const supply : bigint = await InteractWithContracts( <rwRecord>func0, Account.A0, true );            
                
    colorOutput( "Total ERC721 Tokens [".concat( `${supply}`.padStart(32,"0"), "]"), "cyan");
        
    for ( var i = 0; i < supply; i++) {
        try {                
            const func1: rwRecord = await setrwRecordFromSmart( 
                    "tokenByIndex", 
                    "Erc721" 
                    );
            
            func1.values = [ i ];
            
            const tokenId : bigint = await InteractWithContracts( 
                <rwRecord>func1, 
                Account.A0, 
                true 
                );                        

            const func2: rwRecord = await setrwRecordFromSmart( 
                "ownerOf", 
                "Erc721" 
                );
            
            func2.values = [ tokenId ];

            const owner : Address = await InteractWithContracts( 
                <rwRecord>func2, 
                Account.A0, 
                true 
                );                        

            const func3: rwRecord = await setrwRecordFromSmart( 
                "balanceOf", 
                "Erc721" 
                );
            
            func3.values = [ owner ];

            const balanceOf : bigint = await InteractWithContracts( 
                <rwRecord>func3, 
                Account.A0, 
                true 
                );                        
                            
            const func4: rwRecord = await setrwRecordFromSmart( 
                "isHoneyType", 
                "Honey" 
                );
            
            func4.values = [ tokenId ];

            const isHoney : boolean = await InteractWithContracts( 
                <rwRecord>func4, 
                Account.A0, 
                true 
                );                        

            const func5: rwRecord = await setrwRecordFromSmart( 
                "isHoneyType", 
                "Honey" 
                );
            
            func5.values = [ tokenId ];

            const isPollen : boolean = await InteractWithContracts( 
                <rwRecord>func5, 
                Account.A0, 
                true 
                );                        
                            
            var token;
            var display;
            if (isHoney) {
                const func6: rwRecord = await setrwRecordFromSmart( 
                    "honey", 
                    "Honey" 
                    );
                
                func6.values = [ tokenId ];
    
                const raw  : `0x{string}`= await InteractWithContracts( 
                    <rwRecord>func6, 
                    Account.A0, 
                    true 
                    );                        

                token = decodeAbiParameters( [ honeyFeatures ], raw );
                display = "[".concat( Typeoftoken[token[0].TokenStruct.token], "] [", Statusoftoken[token[0].TokenStruct.state], "] [", token[0].TokenFundSpecific.hash0, "]");
                }
            else if (isPollen) {
                const func6: rwRecord = await setrwRecordFromSmart( 
                    "pollen", 
                    "Pollen" 
                    );
                
                func6.values = [ tokenId ];
    
                const raw : `0x{string}` = await InteractWithContracts( 
                    <rwRecord>func6, 
                    Account.A0, 
                    true 
                    );                        

                token = decodeAbiParameters( [ pollenFeatures ], raw );
                display = "[".concat( "]");
                }
            else throw("unrecognized");
            //console.log(token)
            colorOutput( "> Token ".concat( `${tokenId}`.padEnd( 8, " "), "| ", 
                        `${balanceOf}`, " => ", owner,  display  ), "yellow"); //  , 
            }
        catch (error) {
            colorOutput( "> Token ".concat( `XXX`.padEnd( 8, " "), " => Problem " ), "red");
            console.log(error)
            }
        }
    }
