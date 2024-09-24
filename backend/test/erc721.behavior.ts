import hre from "hardhat";
import { shouldSupportInterface } from "./interface.test";
import { expect } from "chai";
import { zeroAddress } from "viem";

const firstTokenId = 5042n;
const secondTokenId = 79217n;
const nonExistentTokenId = 13n;
const fourthTokenId = 4n;
const baseURI = 'https://api.example.com/v1/';

export const shouldBehaveLikeERC721 = () => {

    beforeEach(function () {
        const [owner, newOwner, approved, operator, other] = this.accounts;
        Object.assign(this, { owner, newOwner, approved, operator, other });
    });

    // shouldSupportInterface(["ERC721"]);

    describe('with mited tokens', function () {

        beforeEach(async function () {
            this.mintContract = await hre.viem.getContractAt("MintFacet", this.contractAddress);
            this.erc721Contract = await hre.viem.getContractAt("IERC721", this.contractAddress);
            this.errors = await hre.viem.getContractAt("ERC721Errors", this.contractAddress);
            this.events = await hre.viem.getContractAt("ERC721Events", this.contractAddress);

            const mintToken = async (account: any, tokenId: bigint) => {
                const { request } = await this.publicClient.simulateContract({
                    address: this.mintContract.address,
                    abi: this.mintContract.abi,
                    functionName: "mint",
                    args: [account.address, tokenId],
                });
                const tx = await this.walletClient.writeContract(request);
                await this.publicClient.waitForTransactionReceipt({ hash: tx });
            }

            await mintToken(this.owner, firstTokenId);
            await mintToken(this.owner, secondTokenId);
            this.to = this.other;
        });

        describe('balanceOf', () => {

            describe('when the given address owns some tokens', function () {
                it('returns the amount of tokens owned by the given address', async function () {
                    expect(
                        await this.publicClient.readContract({
                            address: this.erc721Contract.address,
                            abi: this.erc721Contract.abi,
                            functionName: "balanceOf",
                            args: [this.owner.address],
                        })
                    ).to.equal(2n);
                });
            });

            describe('when the given address does not own any tokens', function () {
                it('returns 0', async function () {
                    expect(
                        await this.publicClient.readContract({
                            address: this.erc721Contract.address,
                            abi: this.erc721Contract.abi,
                            functionName: "balanceOf",
                            args: [this.other.address],
                        })
                    ).to.equal(0n);
                });
            });

            describe('when querying the zero address', function () {
                it('throws', async function () {
                    await expect(
                        this.publicClient.readContract({
                            address: this.erc721Contract.address,
                            abi: this.erc721Contract.abi,
                            functionName: "balanceOf",
                            args: [zeroAddress],
                        })
                    )
                        .to.be.revertedWithCustomError(this.errors, 'ERC721InvalidOwner')
                        .withArgs(zeroAddress);
                });
            });

        })

    });
}