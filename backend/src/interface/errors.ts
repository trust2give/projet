import { colorOutput, displayAddress } from "../libraries/format";
import { NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";

export interface errorFrame {
    cause : string,
    details : string,
    docsPath: string,
    metaMessages: string,
    shortMessage: string,
    version: string,
    name: string,
    abi: string,
    args: string,
    contractAddress: string,
    formattedArgs: string,
    functionName: string,
    sender: string
    }

/// manageErrors manages and display the error object and messages returned from a call to a smart contract
///

export function manageErrors(error: any, pad?: number) {
    const errorLabel : Array<any> = Object.entries(<errorFrame>error);
    //console.log(errorLabel, "\n");
    var features : string[] = new Array(10);

    for ( const item of errorLabel) {
        switch (item[0]) {
            case "shortMessage": {
                features[0] = colorOutput("[shortMessage: ".concat( item[1], "]"), "magenta", true);
                break;
                }
            case "metaMessages": {
                features[1] = colorOutput("[metaMessages: ".concat( item[1][0], "]"), "red", true);
                break;
                }
            case "contractAddress": {
                features[2] = colorOutput("[Contract: ".concat( displayAddress( item[1], "yellow", <number>pad), "]"), "magenta", true);
                break;
                }
            case "functionName": {
                features[3] = colorOutput("[function: ".concat( item[1], "]"), "magenta", true);
                break;
                }
            case "args": {
                features[4] = colorOutput( "[Args: ".concat( item[1].reduce( ( acc, cur) => {
                    if (typeof cur == "string") {
                        if (cur.match(regex)) return acc.concat( displayAddress( cur, "yellow", false ), " " );
                        if (cur.match(regex2)) return acc.concat( displayAddress( cur, "cyan", false ), " " );
                        }
                    else if (typeof cur == "bigint") return acc.concat( colorOutput( `${cur}`, "cyan", true ), " " );
                    else if (typeof cur == "boolean") return acc.concat( colorOutput( (cur) ? "True" : "False", "cyan", true ), " " );
                    else if (typeof cur == "number") return acc.concat( colorOutput( `${cur}`, "cyan", true ), " " );
                    return acc.concat( colorOutput( cur, "cyan", true ), " " );
                    }, " " ), " ]" ), "blue", true);
                break;
                }
            case "name": {
                features[5] = colorOutput("[Name: ".concat( item[1], "]"), "yellow", true);
                break;
                }
            case "sender": {
                features[6] = colorOutput("[sender: ".concat( item[1], "]"), "yellow", true);
                break;
                }
            case "formattedArgs": {
                features[7] = colorOutput("[function: ".concat( item[1], "]"), "yellow", true);
                break;
                }
            case "cause": {
                features[8] = colorOutput("[function: ".concat( item[1], "]"), "yellow", true);
                break;
                }
            default:
            }
        }
    colorOutput(features.join("\n"), "white");
    }