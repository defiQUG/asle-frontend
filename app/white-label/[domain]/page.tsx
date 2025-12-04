'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function WhiteLabelDappPage() {
  const params = useParams();
  const domain = params.domain as string;
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, [domain]);

  const fetchConfig = async () => {
    try {
      // In production, this would fetch from the white-label API
      // For now, we'll use a mock or fetch from admin API
      const res = await fetch(`/api/white-label/${domain}`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const primaryColor = config?.primaryColor || '#3B82F6';
  const secondaryColor = config?.secondaryColor || '#8B5CF6';
  const logoUrl = config?.logoUrl;

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(to bottom right, ${primaryColor}15, ${secondaryColor}15)`,
      }}
    >
      <nav
        className="shadow-sm"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-8" />
              ) : (
                <h1 className="text-xl font-bold text-white">{config?.name || 'ASLE'}</h1>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <>
                  <span className="text-sm text-white">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <button
                    onClick={() => disconnect()}
                    className="px-4 py-2 text-sm text-white hover:bg-white/20 rounded-md"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={() => connect({ connector: connectors[0] })}
                  className="px-4 py-2 bg-white text-gray-900 rounded-md hover:bg-gray-100"
                  style={{ color: primaryColor }}
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h2
            className="text-4xl font-bold mb-4"
            style={{ color: primaryColor }}
          >
            Welcome to {config?.name || 'ASLE'}
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            {config?.description || 'DeFi liquidity platform'}
          </p>
          {!isConnected && (
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="px-8 py-4 text-white rounded-lg text-lg font-semibold hover:opacity-90 transition"
              style={{ backgroundColor: primaryColor }}
            >
              Connect Wallet to Get Started
            </button>
          )}
        </div>

        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              style={{ borderTop: `4px solid ${primaryColor}` }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Liquidity Pools
              </h3>
              <p className="text-sm text-gray-600">
                Provide liquidity and earn fees
              </p>
            </div>

            <div
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              style={{ borderTop: `4px solid ${secondaryColor}` }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Vaults
              </h3>
              <p className="text-sm text-gray-600">
                Deposit assets into yield vaults
              </p>
            </div>

            <div
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              style={{ borderTop: `4px solid ${primaryColor}` }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Governance
              </h3>
              <p className="text-sm text-gray-600">
                Participate in DAO governance
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

