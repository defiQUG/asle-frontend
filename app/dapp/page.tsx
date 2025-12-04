'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function UserDappPage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [portfolio, setPortfolio] = useState<any>(null);

  useEffect(() => {
    if (address) {
      fetchPortfolio();
    }
  }, [address]);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(`/api/analytics/portfolio/${address}`);
      const data = await res.json();
      setPortfolio(data);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">ASLE DApp</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <>
                  <span className="text-sm text-gray-700">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <button
                    onClick={() => disconnect()}
                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={() => connect({ connector: connectors[0] })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {!isConnected ? (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to ASLE
            </h2>
            <p className="text-gray-600 mb-8">
              Connect your wallet to get started
            </p>
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Portfolio
              </h2>
              {portfolio ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${portfolio.totalValue || '0.00'}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Pool Positions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Object.keys(portfolio.poolPositions || {}).length}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Vault Positions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Object.keys(portfolio.vaultPositions || {}).length}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Loading portfolio...</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link
                href="/pools"
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Liquidity Pools
                </h3>
                <p className="text-sm text-gray-600">
                  Provide liquidity and earn fees
                </p>
              </Link>

              <Link
                href="/vaults"
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Vaults
                </h3>
                <p className="text-sm text-gray-600">
                  Deposit assets into yield vaults
                </p>
              </Link>

              <Link
                href="/governance"
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Governance
                </h3>
                <p className="text-sm text-gray-600">
                  Participate in DAO governance
                </p>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

