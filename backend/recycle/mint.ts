import hre from "hardhat";
import { zeroAddress } from "viem";

const main = async () => {
    const publicClient = await hre.viem.getPublicClient();
    const [walletClient] = await hre.viem.getWalletClients();

    const contract = await hre.viem.getContractAt("TestFacet", "0xccdd757550511c285ed486ae623cdb99f0ea6126");
    const { request } = await publicClient.simulateContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "mint",
    });

    const tx = await walletClient.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash: tx });

    console.log(`mint success`);
}

main();