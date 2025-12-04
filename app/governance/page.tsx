'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Proposal {
  id: number
  proposalType: string
  status: string
  proposer: string
  description: string
  forVotes: string
  againstVotes: string
  startTime: string
  endTime: string
}

export default function GovernancePage() {
  const { address, isConnected } = useAccount()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [treasury, setTreasury] = useState<{ ETH: string; USDC: string }>({ ETH: '0', USDC: '0' })
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchProposals()
    fetchTreasury()
  }, [])

  const fetchProposals = async () => {
    try {
      setLoading(true)
      // In production, this would fetch from API
      // For now, using mock structure
      setProposals([])
    } catch (error: any) {
      toast.error('Failed to fetch proposals')
    } finally {
      setLoading(false)
    }
  }

  const fetchTreasury = async () => {
    try {
      // In production, fetch from GovernanceFacet
      setTreasury({ ETH: '0', USDC: '0' })
    } catch (error) {
      console.error('Error fetching treasury:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'passed':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'executed':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Governance</h1>
          {isConnected && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Proposal
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Active Proposals</h2>
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : proposals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No active proposals</p>
                  {isConnected && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Create First Proposal
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <Link
                      key={proposal.id}
                      href={`/governance/proposals/${proposal.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">{proposal.description}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(proposal.status)}`}>
                          {proposal.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{proposal.proposalType}</p>
                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="text-gray-600">For: </span>
                          <span className="font-semibold text-green-600">{proposal.forVotes}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Against: </span>
                          <span className="font-semibold text-red-600">{proposal.againstVotes}</span>
                        </div>
                        <div className="text-gray-500">
                          Ends: {new Date(proposal.endTime).toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Treasury</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">ETH</span>
                  <span className="font-semibold">{treasury.ETH}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-600">USDC</span>
                  <span className="font-semibold">{treasury.USDC}</span>
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Manage Treasury
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Proposal Types</h2>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-gray-50 rounded">
                  <p className="font-semibold">Parameter Change</p>
                  <p className="text-gray-600 text-xs">Update system parameters</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="font-semibold">Facet Upgrade</p>
                  <p className="text-gray-600 text-xs">Upgrade smart contract facets</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="font-semibold">Treasury Withdrawal</p>
                  <p className="text-gray-600 text-xs">Withdraw from treasury</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="font-semibold">Emergency Pause</p>
                  <p className="text-gray-600 text-xs">Emergency system pause</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
