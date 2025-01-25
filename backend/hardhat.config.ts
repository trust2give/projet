import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-viem";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

dotenvConfig({ path: resolve(__dirname, "./.env") });

const {
    NETWORK,
    ACCOUNT_MNEMONIC,
    MAINNET_RPC_URL,
    SEPOLIA_RPC_URL,
    MAINNET_SCAN_API_KEY
} = process.env;

const accounts = {
    mnemonic: ACCOUNT_MNEMONIC!,
    path: "m/44'/60'/0'/0",
    initialIndex: 0,
    count: 11,
    passphrase: "",
}

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    defaultNetwork: NETWORK!,
    networks: {
	T2G: {
            url: "http://46.226.107.26:8545",
            accounts: "remote",
        },

	    /*        hardhat: {
	    port: 7545,
            chainId: 1337,
        },
        mainnet: {
        T2G: {
            url: "http://46.226.107.26:8545",
            accounts: "remote",
        },
        mainnet: {
            chainId: 1,
            url: MAINNET_RPC_URL!,
            accounts,
        },
        sepolia: {
            chainId: 11155111,
            url: SEPOLIA_RPC_URL!,
            accounts,
        }*/
    },
    etherscan: {
        apiKey: {
            mainnet: MAINNET_SCAN_API_KEY!,
            sepolia: MAINNET_SCAN_API_KEY!,
        }
    }
};

/*
*/

export default config;
