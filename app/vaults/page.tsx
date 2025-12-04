'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { VAULT_FACET_ABI, DIAMOND_ADDRESS } from '@/lib/contracts'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import api from '@/lib/api'
import { formatEther, parseEther } from 'viem'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Vault {
  id: number
  asset: string | null
  totalAssets: string
  totalSupply: string
  isMultiAsset: boolean
  active: boolean
}

export default function VaultsPage() {
  const { address, isConnected } = useAccount()
  const [vaults, setVaults] = useState<Vault[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVaultId, setSelectedVaultId] = useState<string>('')
  const [depositAmount, setDepositAmount] = useState('')

  const { writeContract, isPending: isCreating } = useWriteContract()
  const { writeContract: writeDeposit, isPending: isDepositing } = useWriteContract()

  useEffect(() => {
    fetchVaults()
  }, [])

  const fetchVaults = async () => {
    try {
      setLoading(true)
      const response = await api.get('/vaults')
      setVaults(response.data.vaults || [])
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to fetch vaults')
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async () => {
    if (!selectedVaultId || !depositAmount) {
      toast.error('Please select a vault and enter amount')
      return
    }

    try {
      writeDeposit({
        address: DIAMOND_ADDRESS as `0x${string}`,
        abi: VAULT_FACET_ABI,
        functionName: 'deposit',
        args: [BigInt(selectedVaultId), parseEther(depositAmount), address!],
      })
      toast.success('Deposit transaction submitted')
      setDepositAmount('')
      setTimeout(fetchVaults, 3000) // Refresh after transaction
    } catch (error: any) {
      toast.error(error.message || 'Failed to deposit')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Vaults</h1>
          {isConnected && (
            <Link
              href="/vaults/create"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Vault
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vaults.map((vault) => (
                  <div
                    key={vault.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold">Vault #{vault.id}</h3>
                      {vault.active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Inactive</span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span>{vault.isMultiAsset ? 'Multi-Asset (ERC-1155)' : 'ERC-4626'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Assets:</span>
                        <span className="font-mono">{formatEther(BigInt(vault.totalAssets || '0'))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Supply:</span>
                        <span className="font-mono">{formatEther(BigInt(vault.totalSupply || '0'))}</span>
                      </div>
                      {vault.asset && (
                        <div className="text-xs text-gray-500 truncate">
                          Asset: {vault.asset}
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/vaults/${vault.id}`}
                      className="block text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {isConnected && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Deposit to Vault</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Vault
                    </label>
                    <select
                      value={selectedVaultId}
                      onChange={(e) => setSelectedVaultId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select a vault</option>
                      {vaults.filter(v => v.active).map((vault) => (
                        <option key={vault.id} value={vault.id}>
                          Vault #{vault.id} - {vault.isMultiAsset ? 'Multi-Asset' : 'ERC-4626'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="text"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="0.0"
                    />
                  </div>
                  <button
                    onClick={handleDeposit}
                    disabled={isDepositing || !selectedVaultId || !depositAmount}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isDepositing ? 'Depositing...' : 'Deposit'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
