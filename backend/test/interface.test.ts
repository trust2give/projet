import { expect } from "chai";
import hre from "hardhat";
import { getInterfaceId } from "./helper";

const INVALID_ID = '0xffffffff';
const FUNCTIONS: Record<string, string[]> = {
    ERC165: ['supportsInterface(bytes4)'],
    ERC721: [
        'balanceOf(address)',
        'ownerOf(uint256)',
        'approve(address,uint256)',
        'getApproved(uint256)',
        'setApprovalForAll(address,bool)',
        'isApprovedForAll(address,address)',
        'transferFrom(address,address,uint256)',
        'safeTransferFrom(address,address,uint256)',
        'safeTransferFrom(address,address,uint256,bytes)'
    ],
    ERC721Enumerable: ['totalSupply()', 'tokenOfOwnerByIndex(address,uint256)', 'tokenByIndex(uint256)'],
    ERC721Metadata: ['name()', 'symbol()', 'tokenURI(uint256)'],
};

export const shouldSupportInterface = async (interfaces: string[] = []) => {
    interfaces.unshift('ERC165');

    describe('ERC165', function () {

        beforeEach(async function () {
            const contract = await hre.viem.getContractAt("IERC165", this.contractAddress);
            Object.assign(this, { contract });
        });

        describe('when the interfaceId is supported', () => {

            it('uses less than 30k gas', async function () {
                for (const iface of interfaces) {
                    const funcs = FUNCTIONS[iface];
                    if (funcs !== undefined) {
                        const gas = await this.publicClient.estimateContractGas({
                            address: this.contract.address,
                            abi: this.contract.abi,
                            functionName: "supportsInterface",
                            args: [getInterfaceId(funcs)],
                            account: this.owner.address
                        });
                        expect(gas).to.lte(30_000n);
                    }
                }
            });

            it('returns true', async function () {
                for (const iface of interfaces) {
                    const funcs = FUNCTIONS[iface];
                    if (funcs !== undefined) {
                        const result = await this.publicClient.readContract({
                            address: this.contract.address,
                            abi: this.contract.abi,
                            functionName: "supportsInterface",
                            args: [getInterfaceId(funcs)],
                        });
                        expect(result).to.be.true;
                    }
                }
            });
        });

        describe('when the interfaceId is not supported', () => {
            it('uses less than 30k', async function () {
                const gas = await this.publicClient.estimateContractGas({
                    address: this.contract.address,
                    abi: this.contract.abi,
                    functionName: "supportsInterface",
                    args: [INVALID_ID],
                    account: this.owner.address
                });
                expect(gas).to.lte(30_000n);
            });

            it('returns false', async function () {
                const result = await this.publicClient.readContract({
                    address: this.contract.address,
                    abi: this.contract.abi,
                    functionName: "supportsInterface",
                    args: [INVALID_ID],
                });
                expect(result).to.be.false;
            });
        })
    });
}