import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, localhost, polygon, arbitrum, optimism, bsc, avalanche, base } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [
    localhost,
    sepolia,
    mainnet,
    polygon,
    arbitrum,
    optimism,
    bsc,
    avalanche,
    base,
  ],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [localhost.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [bsc.id]: http(),
    [avalanche.id]: http(),
    [base.id]: http(),
  },
})

