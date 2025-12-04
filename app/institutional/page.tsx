'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface CustodialWallet {
  walletId: string
  address: string
  provider: string
  type: 'hot' | 'warm' | 'cold'
  mpcEnabled: boolean
}

export default function InstitutionalPage() {
  const { address, isConnected } = useAccount()
  const [wallets, setWallets] = useState<CustodialWallet[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<'fireblocks' | 'coinbase' | 'bitgo'>('fireblocks')
  const [selectedType, setSelectedType] = useState<'hot' | 'warm' | 'cold'>('warm')

  useEffect(() => {
    if (isConnected) {
      fetchWallets()
    }
  }, [isConnected])

  const fetchWallets = async () => {
    try {
      setLoading(true)
      const response = await api.get('/custodial/wallets')
      if (response.data.success) {
        setWallets(response.data.wallets || [])
      }
    } catch (error: any) {
      console.error('Error fetching wallets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWallet = async () => {
    try {
      setLoading(true)
      const response = await api.post('/custodial/wallets', {
        provider: selectedProvider,
        type: selectedType
      })
      if (response.data.success) {
        toast.success('Custodial wallet created')
        setShowCreateModal(false)
        await fetchWallets()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create wallet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Institutional Portal</h1>
          {isConnected && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Custodial Wallet
            </button>
          )}
        </div>

        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">Please connect your wallet to access institutional features</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Custodial Wallets</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : wallets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No custodial wallets</p>
                {isConnected && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Create Wallet
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {wallets.map((wallet) => (
                  <div key={wallet.walletId} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{wallet.provider}</p>
                        <p className="text-sm text-gray-600 font-mono">{wallet.address}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        wallet.type === 'hot' ? 'bg-red-100 text-red-800' :
                        wallet.type === 'warm' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {wallet.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">MPC Enabled:</span>
                      <span className={wallet.mpcEnabled ? 'text-green-600' : 'text-gray-400'}>
                        {wallet.mpcEnabled ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Treasury Management</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Assets</p>
                <p className="text-3xl font-bold">$0.00</p>
              </div>
              <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Manage Treasury
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">MPC Key Management</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-600">Key Shares:</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-600">Threshold:</span>
                <span className="font-semibold">2</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-green-600">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Bank Integrations</h2>
            <div className="space-y-3">
              <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-green-900">SWIFT</p>
                    <p className="text-sm text-green-700">Secure messaging network</p>
                  </div>
                  <span className="px-3 py-1 bg-green-200 text-green-800 rounded text-sm font-semibold">
                    Connected
                  </span>
                </div>
              </div>
              <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-green-900">ISO 20022</p>
                    <p className="text-sm text-green-700">Modern messaging standard</p>
                  </div>
                  <span className="px-3 py-1 bg-green-200 text-green-800 rounded text-sm font-semibold">
                    Connected
                  </span>
                </div>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Configure Integrations
              </button>
            </div>
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-semibold mb-4">Create Custodial Wallet</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="fireblocks">Fireblocks</option>
                    <option value="coinbase">Coinbase Prime</option>
                    <option value="bitgo">BitGo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="hot">Hot Wallet</option>
                    <option value="warm">Warm Wallet</option>
                    <option value="cold">Cold Wallet</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCreateWallet}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Create'}
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
