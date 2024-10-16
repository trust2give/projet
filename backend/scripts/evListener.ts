const { ethers } = require("hardhat");

export type evRecord = { 
    name: string, 
    args?: Array<any>
  }


export const emittedEvents : evRecord[] = [];

export const saveEvents = async (tx) => {
    const receipt = await tx.wait();
    receipt.events.forEach(ev => {
        if (ev.event) {
            emittedEvents.push({
                name: ev.event,
                args: ev.args
            });
        }
    });
    console.log(`emittedEvents: `, emittedEvents);
}

/*
import ERC20ABI from "@openzeppelin/contracts/build/contracts/ERC20.json";

// [...]

it('perform a complex multi-contract operation', async function () {
  // Load the contract instance using the deployment function
  const {
    myCoolContractDeployed,
    myCoolToken
  } = await loadFixture(deploy);

  await myCoolContractDeployed.write.CoolFunct([BigInt(1)]);

  const publicClient = await hre.viem.getPublicClient();
  const logs = await  publicClient.getContractEvents({
      abi: ERC20ABI.abi,
      address: myCoolToken.address, // optional filter
      eventName: 'Approval', // optional filter, name taken form the ABI (erc20: Transfer, Approval)
  })
  console.log(logs);
  expect(logs.length).to.equal(1);
});*/