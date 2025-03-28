import { Address, encodeAbiParameters, decodeAbiParameters } from 'viem'
//import { convertType } from "../libraries/utils";
import { dataDecodeABI, typeRouteOutput, 
    TypeofUnitType,
    TypeofUnitSize, 
    TypeofSector, 
    TypeofEntityType, 
    Statusoftoken, 
    abiItem } from "../interface/types";

/*
export function showLog( silent?: boolean ) {
    if (!silent || silent == undefined) colorOutput(<string>globalState.log);
    addLog("\n");
    }
*/
/*
export function displayInstance( rwItem : rwRecord, pad?: number ) {
    // Formating input values for a readable shape >> stdout 
    const dispArgs = parseAndDisplayInputAndOutputs( 
        rwItem.args, 
        rwItem.values, 
        );

    displayAddress( 
        rwItem.instance.address, 
        "yellow", 
        <number>globalState.pad 
        );

    displayContract(
        rwItem.contract, 
        "cyan", 
        15
        );

    addLog( ":: ".concat( ("label" in rwItem) ? <string>rwItem.label : rwItem.function ));
    addLog( "[ ".concat( colorOutput(dispArgs, "blue", true)," ] >> " ));
    }
*/
// Display an address either as a full format or as an <Account> value
// depends on the value for accountList
// if pad = 0 / undefined / not present => Account format
// if pad > 0 : display the @x format, with the <pad> first characters (22+ = full display)
/*
export function displayAddress( addr : Address, color: string, pad: number | boolean) {
    const item : accountType = Object.values(accountRefs).find( (item : accountType) => item.address.toUpperCase() == addr.toUpperCase() );

    if (item != undefined && <boolean>pad != false) {
        addLog( ":".concat( colorOutput( "[@".concat(item.name, "]"), color, true), "::") );
        }
    else addLog( ":".concat( colorOutput( "[@".concat(addr.substring(0, (!<boolean>pad) ? 64 : (<number>pad > 2) ? <number>pad : 6 ), "...]"), color, true), "::") );
    }
*/
/*
export function displayRetunedValue( method : any, color: string, pad?: number ) {
    addLog( 
    colorOutput( 
        (typeof method === "object") ? method.reduce( (acc, cur) => { return cur.concat(acc, "|")} ) 
        : (pad) ? "[Tx:".concat( method.substring(0, pad ), "..]") : method, 
        color, 
        true ));
    }
        */
/*
export function displayEvents( EvtInputs: any, event : any, color: string, pad?: number ) {
    const dispEvents = parseAndDisplayInputAndOutputs( 
        EvtInputs, 
        Object.values(event.args)
        );
    
    addLog( 
        colorOutput( 
            "\n >> Event ".concat( 
                event.name, 
                dispEvents, 
                " "), 
           color,
           true 
            )
        );
    }
*/

export function parseReadValues( 
    resultAbi : abiItem[] | { name: string, type: string }[], 
    result : any,
    decode? : boolean
    ) : { [cle: string]: any } {
    
    // We get the results     
    const values = (decode && resultAbi.length > 0) ? decodeAbiParameters( resultAbi, result ) : result;  

    console.log( "parseReadValue => ", values);
    
    return values;
    var beacon = undefined;

    // resultAbi: Get the ABI format to apply to the byte coded result in dataDecodeABI "TokenEntitySpecific"
    // abiItem { component: [ abiData ], name: string, type: string }
    // abiData { name, type, internalType }

    /*colorOutput( "> ".concat(
        "[".concat(transactionHash,"] "), 
        " => ", 
        `${value[0].name} `,
        `${value[0].uid} `,
        `${value[0].email} `,
        `${value[0].postal} `,
        TypeofEntityType[value[0].entity], " ", 
        TypeofSector[value[0].sector], " ",
        TypeofUnitType[value[0].unitType], " ",
        TypeofUnitSize[value[0].unitSize], " ",
        TypeCountries[value[0].country]
            ), "cyan");*/
/*
    beacon = result.map((val) => {
        if (Array.isArray(val)) {
            return "\n".concat(
                parseAndDisplayInputAndOutputs( 
                    resultAbi, 
                    [val] 
                    ));
            }
        else if (typeof val == "object") {
            return "\n[".concat( Object.entries(val).map((item) => {
                if ("components" in resultAbi[0]) {
                    const abi = resultAbi[0].components.find((el) => el.name == item[0])

                    if ("components" in abi) return "\n".concat(
                        parseAndDisplayInputAndOutputs( 
                            abi.components, 
                            Object.values(item[1]) 
                            )
                        );
                    else return "\n".concat(
                        parseAndDisplayInputAndOutputs( 
                            [ abi ], 
                            [ item[1] ] 
                            )
                        );
                }
            }).join("|"), "\n]");
        }
        }).join("|"), "\n]";
    */
    }

/*
export function displayContract( contract : string, color: string, pad?: number ) {
    const label = contract.substring(0, pad ? pad : 20).padEnd( pad ? pad : 20, '.');
    addLog( ":".concat( colorOutput( label, color, true), "::") );
    }
*/


export function colorOutput( text: string, color?: string, hide?: boolean ) : string {
    var output ="";
    switch (color) {
        case "yellow": {
            output = '\x1b[33m '.concat( text, ' \x1b[0m');
            break;
            }
        case "blue": {
            output = '\x1b[34m '.concat( text, ' \x1b[0m');
            break;
            }
        case "green": {
            output = '\x1b[32m '.concat( text, ' \x1b[0m');
            break;
            }
        case "red": {
            output = '\x1b[31m '.concat( text, ' \x1b[0m');
            break;
            }
        case "cyan": {
            output = '\x1b[36m '.concat( text, ' \x1b[0m');
            break;
            }
        case "magenta": {
            output = '\x1b[35m '.concat( text, ' \x1b[0m');
            break;
            }    
        case "white": {
            output = '\x1b[37m '.concat( text, ' \x1b[0m');
            break;
            }
        default: {
            output = text;
            }
        }
    if (!hide) console.log(output);
    return output;
    }

/*
export function showObject( data: any, eol: boolean = false ) {
    var label: string = "";
    if (data == null) return "Object::Null";
    for (const [key, value] of Object.entries(data)) {
        const t = typeof value;
        const ret = eol ? `\n` : "";
        switch (t) {
            case "number":
            case "string":
            case "bigint": label += `${key} ${t.slice(0,1)}: ${value} ${ret}`; break;
            case "boolean": label += `${key} : ${value ? "TRUE" : "FALSE" } ${ret}`; break;
            case "object":
                if (Array.isArray(value)) {
                    const tab = value.reduce((accumulator, currentValue) => { 
                        return `${accumulator} ${typeof(currentValue) === "object" ? showObject(currentValue, false) : currentValue} |` }, "|") 
                    label += `${key}[Arr] : ${tab} ${ret}`;
                    }
                else label += showObject( value );
                break;
            default:
            }
        }
    return label;
    }
*/
/*
function parseAndDisplayInputAndOutputs( 
    abi : Array<any>,       // Array of abi definition of input or output variables
    values : Array<any>,    // Array of values (inputs or output) to decode and transform
    ) : string {

    return values.map((arg, i) => {
            return convertType( 
                abi, 
                i, 
                arg, 
                typeRouteOutput, 
                abi[i].name
                );
        }).join(" | ");
    }
    */