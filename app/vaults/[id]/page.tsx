'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { VAULT_FACET_ABI, DIAMOND_ADDRESS } from '@/lib/contracts'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { LineChart } from '@/components/charts/LineChart'
import api from '@/lib/api'
import { formatEther, parseEther } from 'viem'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Vault {
  id: number
  vaultId: string
  asset: string | null
  totalAssets: string
  totalSupply: string
  isMultiAsset: boolean
  active: boolean
}

export default function VaultDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const vaultId = params.id as string
  const { address, isConnected } = useAccount()
  const [vault, setVault] = useState<Vault | null>(null)
  const [loading, setLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const { writeContract, isPending: isDepositing } = useWriteContract()
  const { writeContract: writeWithdraw, isPending: isWithdrawing } = useWriteContract()

  useEffect(() => {
    if (vaultId) {
      fetchVaultDetails()
    }
  }, [vaultId])

  const fetchVaultDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/vaults/${vaultId}`)
      setVault(response.data.vault || response.data)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to fetch vault details')
      router.push('/vaults')
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async () => {
    if (!vault || !depositAmount) {
      toast.error('Please enter amount')
      return
    }

    try {
      writeContract({
        address: DIAMOND_ADDRESS as `0x${string}`,
        abi: VAULT_FACET_ABI,
        functionName: 'deposit',
        args: [
          BigInt(vault.vaultId || vaultId),
          parseEther(depositAmount),
          address!,
        ],
      })
      toast.success('Deposit transaction submitted')
      setDepositAmount('')
      setTimeout(fetchVaultDetails, 3000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to deposit')
    }
  }

  const handleWithdraw = async () => {
    if (!vault || !withdrawAmount) {
      toast.error('Please enter amount')
      return
    }

    try {
      writeWithdraw({
        address: DIAMOND_ADDRESS as `0x${string}`,
        abi: VAULT_FACET_ABI,
        functionName: 'withdraw',
        args: [
          BigInt(vault.vaultId || vaultId),
          parseEther(withdrawAmount),
          address!,
          address!,
        ],
      })
      toast.success('Withdraw transaction submitted')
      setWithdrawAmount('')
      setTimeout(fetchVaultDetails, 3000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to withdraw')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!vault) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Vault not found</p>
            <Link href="/vaults" className="text-indigo-600 hover:underline mt-2 inline-block">
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
          <h1 className="text-3xl font-bold text-gray-900">
            Vault #{vault.id}
          </h1>
          <p className="text-gray-600 mt-2">
            {vault.isMultiAsset ? 'Multi-Asset Vault (ERC-1155)' : 'ERC-4626 Vault'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Vault Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Assets</p>
                  <p className="text-2xl font-bold">{formatEther(BigInt(vault.totalAssets || '0'))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Supply</p>
                  <p className="text-2xl font-bold">{formatEther(BigInt(vault.totalSupply || '0'))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="text-lg font-semibold">
                    {vault.isMultiAsset ? 'Multi-Asset (ERC-1155)' : 'ERC-4626'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded text-sm ${vault.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {vault.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {vault.asset && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Asset Address</p>
                    <p className="text-sm font-mono truncate">{vault.asset}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Performance Chart</h2>
              <div className="h-64">
                <LineChart
                  data={[]}
                  xKey="time"
                  yKey="value"
                  color="#3b82f6"
                />
              </div>
            </div>
          </div>

          {isConnected && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Deposit</h2>
                <div className="space-y-4">
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
                    disabled={isDepositing || !depositAmount}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isDepositing ? 'Depositing...' : 'Deposit'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Withdraw</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="text"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="0.0"
                    />
                  </div>
                  <button
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || !withdrawAmount}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

