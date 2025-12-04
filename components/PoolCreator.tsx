'use client'

import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { LIQUIDITY_FACET_ABI, DIAMOND_ADDRESS } from '@/lib/contracts'
import { parseEther } from 'viem'
import toast from 'react-hot-toast'
import { LoadingSpinner } from './LoadingSpinner'

export function PoolCreator() {
  const [baseToken, setBaseToken] = useState('')
  const [quoteToken, setQuoteToken] = useState('')
  const [initialBaseReserve, setInitialBaseReserve] = useState('')
  const [initialQuoteReserve, setInitialQuoteReserve] = useState('')
  const [virtualBaseReserve, setVirtualBaseReserve] = useState('')
  const [virtualQuoteReserve, setVirtualQuoteReserve] = useState('')
  const [k, setK] = useState('0.1')
  const [oraclePrice, setOraclePrice] = useState('1')

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const handleCreatePool = async () => {
    if (!baseToken || !quoteToken) {
      toast.error('Please enter token addresses')
      return
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(baseToken) || !/^0x[a-fA-F0-9]{40}$/.test(quoteToken)) {
      toast.error('Invalid token address format')
      return
    }

    try {
      writeContract({
        address: DIAMOND_ADDRESS as `0x${string}`,
        abi: LIQUIDITY_FACET_ABI,
        functionName: 'createPool',
        args: [
          baseToken as `0x${string}`,
          quoteToken as `0x${string}`,
          parseEther(initialBaseReserve || '0'),
          parseEther(initialQuoteReserve || '0'),
          parseEther(virtualBaseReserve || '0'),
          parseEther(virtualQuoteReserve || '0'),
          BigInt(Math.floor(parseFloat(k) * 1e18)),
          parseEther(oraclePrice),
        ],
      })
      toast.success('Pool creation transaction submitted')
    } catch (error: any) {
      toast.error(error.message || 'Error creating pool')
      console.error('Error creating pool:', error)
    }
  }

  if (isSuccess) {
    toast.success('Pool created successfully!')
  }

  if (error) {
    toast.error(`Transaction failed: ${error.message}`)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create Liquidity Pool</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Token Address *
            </label>
            <input
              type="text"
              value={baseToken}
              onChange={(e) => setBaseToken(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              placeholder="0x..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quote Token Address *
            </label>
            <input
              type="text"
              value={quoteToken}
              onChange={(e) => setQuoteToken(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              placeholder="0x..."
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Base Reserve
            </label>
            <input
              type="text"
              value={initialBaseReserve}
              onChange={(e) => setInitialBaseReserve(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="0.0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Quote Reserve
            </label>
            <input
              type="text"
              value={initialQuoteReserve}
              onChange={(e) => setInitialQuoteReserve(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="0.0"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Virtual Base Reserve
            </label>
            <input
              type="text"
              value={virtualBaseReserve}
              onChange={(e) => setVirtualBaseReserve(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="0.0"
            />
            <p className="text-xs text-gray-500 mt-1">Virtual liquidity for better pricing</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Virtual Quote Reserve
            </label>
            <input
              type="text"
              value={virtualQuoteReserve}
              onChange={(e) => setVirtualQuoteReserve(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="0.0"
            />
            <p className="text-xs text-gray-500 mt-1">Virtual liquidity for better pricing</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slippage Coefficient (k)
            </label>
            <input
              type="text"
              value={k}
              onChange={(e) => setK(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="0.1"
            />
            <p className="text-xs text-gray-500 mt-1">Range: 0-1 (lower = less slippage)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Oracle Price
            </label>
            <input
              type="text"
              value={oraclePrice}
              onChange={(e) => setOraclePrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="1.0"
            />
            <p className="text-xs text-gray-500 mt-1">Reference price from oracle</p>
          </div>
        </div>
        <button
          onClick={handleCreatePool}
          disabled={isPending || isConfirming || !baseToken || !quoteToken}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isPending || isConfirming ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Creating...</span>
            </>
          ) : (
            'Create Pool'
          )}
        </button>
      </div>
    </div>
  )
}
