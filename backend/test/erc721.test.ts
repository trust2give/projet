import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { depolyDiamond } from "../scripts/deploy";
import { shouldBehaveLikeERC721 } from "./erc721.behavior";

const fixture = async () => {
    return {
        publicClient: await hre.viem.getPublicClient(),
        walletClient: (await hre.viem.getWalletClients())[0],
        accounts: (await hre.viem.getWalletClients()).map((client) => client.account),
        contractAddress: await depolyDiamond()
    }
}

describe('ERC721', () => {
    beforeEach(async function() {
        Object.assign(this, await loadFixture(fixture));
    });

    shouldBehaveLikeERC721();
});