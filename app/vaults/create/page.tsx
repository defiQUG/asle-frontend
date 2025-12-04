'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount, useWriteContract } from 'wagmi'
import { VAULT_FACET_ABI, DIAMOND_ADDRESS } from '@/lib/contracts'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import api from '@/lib/api'
import { parseEther } from 'viem'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function CreateVaultPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [creating, setCreating] = useState(false)
  const [vaultType, setVaultType] = useState<'erc4626' | 'multiasset'>('erc4626')
  const [assetAddress, setAssetAddress] = useState('')
  const [initialDeposit, setInitialDeposit] = useState('')
  const { writeContract, isPending } = useWriteContract()

  const handleCreateVault = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet')
      return
    }

    if (vaultType === 'erc4626' && !assetAddress) {
      toast.error('Please enter asset address for ERC-4626 vault')
      return
    }

    try {
      setCreating(true)

      writeContract({
        address: DIAMOND_ADDRESS as `0x${string}`,
        abi: VAULT_FACET_ABI,
        functionName: 'createVault',
        args: [
          vaultType === 'erc4626' ? assetAddress as `0x${string}` : '0x0000000000000000000000000000000000000000',
          vaultType === 'multiasset',
        ],
      })
      
      // If initial deposit is provided, deposit after vault creation
      // Note: This would require waiting for the vault creation transaction to complete
      // In production, you might want to handle this in a separate step

      toast.success('Vault creation transaction submitted')
      
      setTimeout(() => {
        router.push('/vaults')
      }, 3000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create vault')
    } finally {
      setCreating(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/vaults" className="text-indigo-600 hover:underline">
              ← Back to Vaults
            </Link>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 mb-4">Please connect your wallet to create a vault</p>
            <Link
              href="/vaults"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-block"
            >
              Back to Vaults
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/vaults" className="text-indigo-600 hover:underline">
            ← Back to Vaults
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Vault</h1>
          <p className="text-gray-600 mt-2">Create a new ERC-4626 or Multi-Asset vault</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
          {creating || isPending ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Creating vault...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vault Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="erc4626"
                      checked={vaultType === 'erc4626'}
                      onChange={(e) => setVaultType(e.target.value as 'erc4626')}
                      className="mr-2"
                    />
                    ERC-4626 Vault
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="multiasset"
                      checked={vaultType === 'multiasset'}
                      onChange={(e) => setVaultType(e.target.value as 'multiasset')}
                      className="mr-2"
                    />
                    Multi-Asset Vault (ERC-1155)
                  </label>
                </div>
              </div>

              {vaultType === 'erc4626' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asset Address
                  </label>
                  <input
                    type="text"
                    value={assetAddress}
                    onChange={(e) => setAssetAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0x..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Address of the ERC-20 token for this vault
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Deposit (Optional)
                </label>
                <input
                  type="text"
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0.0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional initial deposit amount
                </p>
              </div>

              <button
                onClick={handleCreateVault}
                disabled={vaultType === 'erc4626' && !assetAddress}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Create Vault
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

