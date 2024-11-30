const hre = require("hardhat");
import { Address, decodeAbiParameters } from 'viem'
import { smart, encodeInterfaces } from "../T2G_Data";
import { dataDecodeABI, abiData, typeRouteArgs, honeyFeatures, pollenFeatures, Typeoftoken, Statusoftoken } from "../interface/types";
import { colorOutput, displayAccountTable } from "../libraries/format";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";
import { accountRefs, globalState, setState, addAccount, account, updateAccountBalance, assignAccounts } from "../logic/states";

export const showTokens = async () => {
    const wallets = await hre.viem.getWalletClients();
    const record1 = <menuRecord>smart.find((el: menuRecord ) => el.tag == "Erc721");
    const record2 = <menuRecord>smart.find((el: menuRecord ) => el.tag == "Honey");
    const record3 = <menuRecord>smart.find((el: menuRecord ) => el.tag == "Pollen");
    const supply : bigint = await record1.instance.read["totalSupply"]( [], wallets[0] );
    colorOutput( "Total ERC721 Tokens [".concat( `${supply}`.padStart(32,"0"), "]"), "cyan");

    for ( var i = 0; i < supply; i++) {
        try {                
            const tokenId : bigint = await record1.instance.read["tokenByIndex"]( [ i ], wallets[0] );
            const owner : Address = await record1.instance.read["ownerOf"]( [ tokenId ], wallets[0] );
            const wallet = Object.values(accountRefs).find((el) => el.address == owner);
            const balanceOf : bigint = await record1.instance.read["balanceOf"]( [ owner ], wallets[0] );
            //console.log("sfsdf",tokenId, owner, balanceOf )
            const isHoney = await record2.instance.read["isHoneyType"]( [ tokenId ], wallets[0] );
            const isPollen : boolean = await record3.instance.read["isPollenType"]( [ tokenId ], wallets[0] );
            //console.log(isHoney)
            //console.log(isPollen)

            var token;
            var display;
            if (isHoney) {
                const raw = await record2.instance.read["honey"]( [ tokenId ], wallets[0] );
                //console.log(raw)
                token = decodeAbiParameters( [ honeyFeatures ], raw );
                //console.log(token)
                display = "[".concat( Typeoftoken[token[0].TokenStruct.token], "] [", Statusoftoken[token[0].TokenStruct.state], "] [", token[0].TokenFundSpecific.hash0, "]");
                }
            else if (isPollen) {
                const raw : `0x{string}` = await record3.instance.read["pollen"]( [ tokenId ], wallets[0] );
                //console.log(raw)
                token = decodeAbiParameters( [ pollenFeatures ], raw );
                //console.log(token)
                display = "[".concat( "]");
                }
            else throw("unrecognized");
            //console.log(token)
            colorOutput( "> Token ".concat( `${tokenId}`.padEnd( 8, " "), "| ", 
                        `${balanceOf}`, " => ", (wallet != undefined) ? wallet.name : owner,  display  ), "yellow"); //  , 
            }
        catch (error) {
            colorOutput( "> Token ".concat( `XXX`.padEnd( 8, " "), " => Problem " ), "red");
            console.log(error)
            }
        }
    }
