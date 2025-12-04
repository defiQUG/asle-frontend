'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { LIQUIDITY_FACET_ABI, DIAMOND_ADDRESS } from '@/lib/contracts'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { LineChart } from '@/components/charts/LineChart'
import api from '@/lib/api'
import { formatEther, parseEther } from 'viem'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Pool {
  id: number
  poolId: string
  baseToken: string
  quoteToken: string
  baseReserve: string
  quoteReserve: string
  active: boolean
  totalLiquidity: string
}

export default function PoolDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const poolId = params.id as string
  const { address, isConnected } = useAccount()
  const [pool, setPool] = useState<Pool | null>(null)
  const [loading, setLoading] = useState(true)
  const [addBaseAmount, setAddBaseAmount] = useState('')
  const [addQuoteAmount, setAddQuoteAmount] = useState('')

  const { writeContract, isPending: isAddingLiquidity } = useWriteContract()

  useEffect(() => {
    if (poolId) {
      fetchPoolDetails()
    }
  }, [poolId])

  const fetchPoolDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/pools/${poolId}`)
      setPool(response.data.pool || response.data)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to fetch pool details')
      router.push('/pools')
    } finally {
      setLoading(false)
    }
  }

  const handleAddLiquidity = async () => {
    if (!pool || !addBaseAmount || !addQuoteAmount) {
      toast.error('Please enter both amounts')
      return
    }

    try {
      writeContract({
        address: DIAMOND_ADDRESS as `0x${string}`,
        abi: LIQUIDITY_FACET_ABI,
        functionName: 'addLiquidity',
        args: [
          BigInt(pool.poolId || poolId),
          parseEther(addBaseAmount),
          parseEther(addQuoteAmount),
        ],
      })
      toast.success('Add liquidity transaction submitted')
      setAddBaseAmount('')
      setAddQuoteAmount('')
      setTimeout(fetchPoolDetails, 3000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to add liquidity')
    }
  }

  // Note: removeLiquidity function not available in current contract interface
  // This would need to be implemented in the contract if needed

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!pool) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Pool not found</p>
            <Link href="/pools" className="text-indigo-600 hover:underline mt-2 inline-block">
              Back to Pools
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
          <Link href="/pools" className="text-indigo-600 hover:underline">
            ← Back to Pools
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Pool #{pool.id}
          </h1>
          <p className="text-gray-600 mt-2">
            {pool.baseToken} / {pool.quoteToken}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Pool Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Base Reserve</p>
                  <p className="text-2xl font-bold">{formatEther(BigInt(pool.baseReserve || '0'))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quote Reserve</p>
                  <p className="text-2xl font-bold">{formatEther(BigInt(pool.quoteReserve || '0'))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Liquidity</p>
                  <p className="text-2xl font-bold">{formatEther(BigInt(pool.totalLiquidity || '0'))}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded text-sm ${pool.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {pool.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Price Chart</h2>
              <div className="h-64">
                <LineChart
                  data={[]}
                  xKey="time"
                  yKey="price"
                  color="#3b82f6"
                />
              </div>
            </div>
          </div>

          {isConnected && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Add Liquidity</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Amount ({pool.baseToken})
                    </label>
                    <input
                      type="text"
                      value={addBaseAmount}
                      onChange={(e) => setAddBaseAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quote Amount ({pool.quoteToken})
                    </label>
                    <input
                      type="text"
                      value={addQuoteAmount}
                      onChange={(e) => setAddQuoteAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="0.0"
                    />
                  </div>
                  <button
                    onClick={handleAddLiquidity}
                    disabled={isAddingLiquidity || !addBaseAmount || !addQuoteAmount}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isAddingLiquidity ? 'Adding...' : 'Add Liquidity'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Remove Liquidity</h2>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Remove liquidity functionality is not yet available in the contract interface.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

