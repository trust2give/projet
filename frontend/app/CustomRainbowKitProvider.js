'use client'
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  hardhat
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

const config = getDefaultConfig({
    appName: 'Trust2Give',
    projectId: '3ba9429800116bd1df45f2dc078731c7',
    chains: [hardhat],
    ssr: true, 
});

const queryClient = new QueryClient();

const CustomRainbowKitProvider = ({ children }) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    { children }
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
};

export default CustomRainbowKitProvider