'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface Delegation {
  delegator: string
  delegatee: string
  votingPower: string
  timestamp: string
}

interface DelegateReputation {
  delegatee: string
  totalDelegated: string
  proposalsVoted: number
  proposalsWon: number
  winRate: number
  averageVoteWeight: string
}

export default function DelegationPage() {
  const { address } = useAccount()
  const [delegations, setDelegations] = useState<Delegation[]>([])
  const [delegates, setDelegates] = useState<DelegateReputation[]>([])
  const [delegateAddress, setDelegateAddress] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDelegations()
    fetchDelegates()
  }, [])

  const fetchDelegations = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/governance/delegation`)
      setDelegations(response.data)
    } catch (error) {
      console.error('Error fetching delegations:', error)
    }
  }

  const fetchDelegates = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/governance/analytics/delegates`)
      setDelegates(response.data)
    } catch (error) {
      console.error('Error fetching delegates:', error)
    }
  }

  const handleDelegate = async () => {
    if (!address || !delegateAddress) return

    // In production, this would call the GovernanceFacet.delegate() function
    // For now, just show a message
    alert(`Delegation would be submitted. In production, this would call the smart contract.`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vote Delegation</h1>
          <p className="mt-2 text-gray-600">Delegate your voting power to trusted delegates</p>
        </div>

        {/* Delegate Form */}
        {address && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Delegate Your Votes</h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={delegateAddress}
                onChange={(e) => setDelegateAddress(e.target.value)}
                placeholder="Enter delegate address"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
              />
              <button
                onClick={handleDelegate}
                disabled={!delegateAddress}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Delegate
              </button>
            </div>
          </div>
        )}

        {/* Delegate Leaderboard */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Top Delegates</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delegate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Delegated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proposals Voted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Win Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {delegates.map((delegate, index) => (
                  <tr key={delegate.delegatee}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">#{index + 1}</span>
                        <span className="font-medium">{delegate.delegatee.slice(0, 10)}...</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseFloat(delegate.totalDelegated).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delegate.proposalsVoted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-semibold ${delegate.winRate >= 50 ? 'text-green-600' : 'text-gray-600'}`}>
                        {delegate.winRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Delegations */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Delegations</h2>
          <div className="space-y-2">
            {delegations.slice(0, 10).map((delegation) => (
              <div key={delegation.delegator} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{delegation.delegator.slice(0, 10)}...</span>
                  <span className="text-gray-500 mx-2">→</span>
                  <span className="font-medium">{delegation.delegatee.slice(0, 10)}...</span>
                </div>
                <span className="text-sm text-gray-500">
                  {parseFloat(delegation.votingPower).toLocaleString()} votes
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

