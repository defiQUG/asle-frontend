'use client'

import { useChainId, useSwitchChain } from 'wagmi'
import { mainnet, polygon, arbitrum, optimism, sepolia, bsc, avalanche, base } from 'wagmi/chains'

const supportedChains = [
  { id: mainnet.id, name: 'Ethereum', icon: '⟠', status: 'online' },
  { id: polygon.id, name: 'Polygon', icon: '⬟', status: 'online' },
  { id: arbitrum.id, name: 'Arbitrum', icon: '🔷', status: 'online' },
  { id: optimism.id, name: 'Optimism', icon: '🔴', status: 'online' },
  { id: bsc.id, name: 'BSC', icon: '🟡', status: 'online' },
  { id: avalanche.id, name: 'Avalanche', icon: '🔺', status: 'online' },
  { id: base.id, name: 'Base', icon: '🔵', status: 'online' },
  { id: sepolia.id, name: 'Sepolia', icon: '🧪', status: 'online' },
]

export function ChainSelector() {
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  return (
    <div className="flex items-center space-x-2">
      <select
        value={chainId}
        onChange={(e) => switchChain({ chainId: Number(e.target.value) })}
        className="px-3 py-2 border border-gray-300 rounded-md bg-white"
      >
        {supportedChains.map((chain) => (
          <option key={chain.id} value={chain.id}>
            {chain.icon} {chain.name} {chain.status === 'online' ? '●' : '○'}
          </option>
        ))}
      </select>
    </div>
  )
}

