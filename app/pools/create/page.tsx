'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount, useWriteContract } from 'wagmi'
import { LIQUIDITY_FACET_ABI, DIAMOND_ADDRESS } from '@/lib/contracts'
import { PoolCreator } from '@/components/PoolCreator'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import api from '@/lib/api'
import { parseEther } from 'viem'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function CreatePoolPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [creating, setCreating] = useState(false)
  const { writeContract, isPending } = useWriteContract()

  const handleCreatePool = async (baseToken: string, quoteToken: string, initialBase: string, initialQuote: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet')
      return
    }

    try {
      setCreating(true)
      
      // Create the pool via contract
      // Note: This is a simplified version - in production, you'd need to calculate
      // virtual reserves, k, and oracle price based on PMM parameters
      const virtualBase = parseEther(initialBase) * BigInt(2) // Example: 2x virtual reserve
      const virtualQuote = parseEther(initialQuote) * BigInt(2)
      const k = BigInt(5000) // Example: 0.5 (5000/10000)
      const oraclePrice = parseEther('1') // Example: 1:1 price
      
      writeContract({
        address: DIAMOND_ADDRESS as `0x${string}`,
        abi: LIQUIDITY_FACET_ABI,
        functionName: 'createPool',
        args: [
          baseToken as `0x${string}`,
          quoteToken as `0x${string}`,
          parseEther(initialBase),
          parseEther(initialQuote),
          virtualBase,
          virtualQuote,
          k,
          oraclePrice,
        ],
      })

      toast.success('Pool creation transaction submitted')
      
      // Wait a bit then redirect
      setTimeout(() => {
        router.push('/pools')
      }, 3000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create pool')
    } finally {
      setCreating(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/pools" className="text-indigo-600 hover:underline">
              ← Back to Pools
            </Link>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 mb-4">Please connect your wallet to create a pool</p>
            <Link
              href="/pools"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-block"
            >
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
          <h1 className="text-3xl font-bold text-gray-900">Create New Pool</h1>
          <p className="text-gray-600 mt-2">Create a new PMM liquidity pool</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {creating || isPending ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Creating pool...</p>
            </div>
          ) : (
            <PoolCreator onCreatePool={handleCreatePool} />
          )}
        </div>
      </div>
    </div>
  )
}

