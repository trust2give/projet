import { getFunctionSelector, hexToBigInt, toHex } from "viem"

export const getInterfaceId = (funcs: string[]) => {
    return toHex(
        funcs.reduce((acc, func) => acc ^ hexToBigInt(getFunctionSelector(func)), 0n),
        { size: 4 }
    );
}