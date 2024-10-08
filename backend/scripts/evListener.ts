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