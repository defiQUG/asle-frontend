'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { PoolCreator } from '@/components/PoolCreator'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import api from '@/lib/api'
import Link from 'next/link'
import { formatEther } from 'viem'

interface Pool {
  id: number
  baseToken: string
  quoteToken: string
  baseReserve: string
  quoteReserve: string
  active: boolean
}

export default function PoolsPage() {
  const { address, isConnected } = useAccount()
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPools()
  }, [])

  const fetchPools = async () => {
    try {
      setLoading(true)
      const response = await api.get('/pools')
      setPools(response.data.pools || [])
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch pools')
      console.error('Error fetching pools:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Liquidity Pools</h1>
          {isConnected && (
            <Link
              href="/pools/create"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Pool
            </Link>
          )}
        </div>

        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">Please connect your wallet to create pools or provide liquidity</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        ) : pools.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">No pools found. Create your first pool to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map((pool) => (
              <Link
                key={pool.id}
                href={`/pools/${pool.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">Pool #{pool.id}</h3>
                  {pool.active ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Inactive</span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Reserve:</span>
                    <span className="font-mono">{formatEther(BigInt(pool.baseReserve || '0'))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quote Reserve:</span>
                    <span className="font-mono">{formatEther(BigInt(pool.quoteReserve || '0'))}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{pool.baseToken.slice(0, 6)}...{pool.baseToken.slice(-4)}</span>
                    <span>/</span>
                    <span>{pool.quoteToken.slice(0, 6)}...{pool.quoteToken.slice(-4)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
