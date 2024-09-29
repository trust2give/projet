import hre from "hardhat";
import { FacetCutAction, getSelectors } from "./utils/diamond";
import { encodeFunctionData } from "viem";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

//import { shouldBehaveLikeERC721 } from "./erc721.behavior";

export const depolyDiamond = async () => {
//async function main() {
    const publicClient = await hre.viem.getPublicClient();
    const [deployWallet] = await hre.viem.getWalletClients();

    // deploy DiamondCutFacet
    const diamondCutFacet = await hre.viem.deployContract("DiamondCutFacet");
    console.log(`diamondCutFacet: ${diamondCutFacet.address}`);

    // deploy Diamond
    const diamond = await hre.viem.deployContract("Diamond", [
        deployWallet.account.address,
        diamondCutFacet.address
    ]);
    console.log(`diamond: ${diamond.address}`);

    const diamondInit = await hre.viem.deployContract("DiamondInit");
    console.log(`diamondInit: ${diamondInit.address}`);

    const facetNames = [
        'DiamondLoupeFacet',
        'OwnershipFacet',
        'ERC721Facet',
        'MintFacet'
    ];
    const cut = [];

    for (const facetName of facetNames) {
        const facet = await hre.viem.deployContract(facetName);

        console.log(`${facetName}: ${facet.address}`);

        cut.push({
            facetAddress: facet.address,
            action: FacetCutAction.Add,
            functionSelectors: getSelectors(facet)
        });
    }

    //console.log("cut structure :", cut);

    const diamondCut = await hre.viem.getContractAt("IDiamondCut", diamond.address);
    const initFunc = encodeFunctionData({
        abi: diamondInit.abi,
        functionName: "init",
        args: [
            "Honey",
            "HONEY"
        ]
    });

    console.log("initFunc structure :", initFunc);

    const { request } = await publicClient.simulateContract({
        address: diamond.address,
        abi: diamondCut.abi,
        functionName: "diamondCut",
        args: [
            cut,
            diamondInit.address,
            initFunc
        ]
    });

    const tx = await deployWallet.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash: tx });

    console.log(`Transaction Hash : ${tx}`);

    return diamond.address;
}

/*main().catch((error) => {
    console.error("Erreur", error);
    process.exitCode = 1;
  });*/