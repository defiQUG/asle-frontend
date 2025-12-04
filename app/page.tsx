'use client'

import Link from 'next/link'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { ChainSelector } from '@/components/ChainSelector'

export default function Home() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">ASLE</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ChainSelector />
              {isConnected ? (
                <>
                  <span className="text-sm text-gray-600">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                  <button
                    onClick={() => disconnect()}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={() => connect({ connector: connectors[0] })}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ali & Saum Liquidity Engine
          </h2>
          <p className="text-xl text-gray-600">
            Hybrid Cross-Chain Liquidity Infrastructure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/pools" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Liquidity Pools</h3>
            <p className="text-gray-600">Create and manage PMM liquidity pools</p>
          </Link>
          <Link href="/vaults" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Vaults</h3>
            <p className="text-gray-600">Deposit assets into ERC-4626 or ERC-1155 vaults</p>
          </Link>
          <Link href="/compliance" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Compliance</h3>
            <p className="text-gray-600">Manage compliance modes and KYC/AML</p>
          </Link>
          <Link href="/governance" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Governance</h3>
            <p className="text-gray-600">DAO proposals and treasury management</p>
          </Link>
          <Link href="/institutional" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Institutional</h3>
            <p className="text-gray-600">Custodial wallets and bank integrations</p>
          </Link>
          <Link href="/monitoring" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Monitoring</h3>
            <p className="text-gray-600">System health and alerts</p>
          </Link>
        </div>

        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800">Please connect your wallet to get started</p>
          </div>
        )}
      </main>
    </div>
  )
}
