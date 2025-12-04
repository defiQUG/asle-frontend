'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAccount } from 'wagmi'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface SnapshotProposal {
  id: string
  title: string
  body: string
  choices: string[]
  start: number
  end: number
  state: string
  author: string
  scores: number[]
  scores_total: number
}

export default function SnapshotPage() {
  const { address } = useAccount()
  const [proposals, setProposals] = useState<SnapshotProposal[]>([])
  const [selectedProposal, setSelectedProposal] = useState<SnapshotProposal | null>(null)
  const [votes, setVotes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProposals()
  }, [])

  useEffect(() => {
    if (selectedProposal) {
      fetchVotes(selectedProposal.id)
    }
  }, [selectedProposal])

  const fetchProposals = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/api/governance/snapshot/proposals`)
      setProposals(response.data)
    } catch (error) {
      console.error('Error fetching Snapshot proposals:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVotes = async (proposalId: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/governance/snapshot/proposal/${proposalId}/votes`)
      setVotes(response.data)
    } catch (error) {
      console.error('Error fetching votes:', error)
    }
  }

  const handleVote = async (proposalId: string, choice: number) => {
    if (!address) {
      alert('Please connect your wallet')
      return
    }

    try {
      // In production, this would require wallet signature
      await axios.post(`${API_URL}/api/governance/snapshot/proposal/${proposalId}/vote`, {
        choice,
        voter: address,
        signature: 'mock-signature', // Would be actual signature in production
      })
      fetchVotes(proposalId)
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handleSync = async (proposalId: string) => {
    try {
      await axios.post(`${API_URL}/api/governance/snapshot/sync/${proposalId}`)
      alert('Proposal synced to local governance')
    } catch (error) {
      console.error('Error syncing proposal:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Snapshot Integration</h1>
          <p className="mt-2 text-gray-600">View and vote on Snapshot proposals</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading proposals...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Proposals List */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Proposals</h2>
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className={`bg-white p-6 rounded-lg shadow cursor-pointer ${
                      selectedProposal?.id === proposal.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedProposal(proposal)}
                  >
                    <h3 className="text-lg font-semibold mb-2">{proposal.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{proposal.body}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs rounded ${
                        proposal.state === 'active' ? 'bg-green-100 text-green-800' :
                        proposal.state === 'closed' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {proposal.state}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSync(proposal.id)
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Sync
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Proposal Details */}
            {selectedProposal && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Proposal Details</h2>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-2xl font-bold mb-4">{selectedProposal.title}</h3>
                  <div className="prose mb-6" dangerouslySetInnerHTML={{ __html: selectedProposal.body }} />
                  
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Choices:</h4>
                    <div className="space-y-2">
                      {selectedProposal.choices.map((choice, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <span>{choice}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                              {selectedProposal.scores?.[index] || 0} votes
                            </span>
                            {selectedProposal.state === 'active' && (
                              <button
                                onClick={() => handleVote(selectedProposal.id, index + 1)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Vote
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Votes ({votes.length})</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {votes.map((vote) => (
                        <div key={vote.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                          <span className="text-gray-600">{vote.voter.slice(0, 10)}...</span>
                          <span className="font-semibold">
                            {typeof vote.choice === 'number' 
                              ? selectedProposal.choices[vote.choice - 1]
                              : 'Multiple choices'}
                          </span>
                          <span className="text-gray-500">{vote.vp} VP</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

