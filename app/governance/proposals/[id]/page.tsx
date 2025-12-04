'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount, useWriteContract } from 'wagmi'
import { GOVERNANCE_FACET_ABI, DIAMOND_ADDRESS } from '@/lib/contracts'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ProposalDiscussion } from '@/components/governance/ProposalDiscussion'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Proposal {
  id: number
  proposalId: string
  proposalType: string
  status: string
  proposer: string
  description: string
  forVotes: string
  againstVotes: string
  startTime: string
  endTime: string
  executed: boolean
}

export default function ProposalDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const proposalId = params.id as string
  const { address, isConnected } = useAccount()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)

  const { writeContract, isPending: isVoting } = useWriteContract()

  useEffect(() => {
    if (proposalId) {
      fetchProposalDetails()
    }
  }, [proposalId])

  const fetchProposalDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/governance/proposals/${proposalId}`)
      setProposal(response.data.proposal || response.data)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to fetch proposal details')
      router.push('/governance')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (support: boolean) => {
    if (!proposal || !isConnected) {
      toast.error('Please connect your wallet')
      return
    }

    try {
      setVoting(true)
      writeContract({
        address: DIAMOND_ADDRESS as `0x${string}`,
        abi: GOVERNANCE_FACET_ABI,
        functionName: 'vote',
        args: [
          BigInt(proposal.proposalId || proposalId),
          support,
        ],
      })
      toast.success(`Vote ${support ? 'for' : 'against'} transaction submitted`)
      setTimeout(fetchProposalDetails, 3000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to vote')
    } finally {
      setVoting(false)
    }
  }

  const handleExecute = async () => {
    if (!proposal || !isConnected) {
      toast.error('Please connect your wallet')
      return
    }

    try {
      writeContract({
        address: DIAMOND_ADDRESS as `0x${string}`,
        abi: GOVERNANCE_FACET_ABI,
        functionName: 'executeProposal',
        args: [BigInt(proposal.proposalId || proposalId)],
      })
      toast.success('Execute transaction submitted')
      setTimeout(fetchProposalDetails, 3000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to execute proposal')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Proposal not found</p>
            <Link href="/governance" className="text-indigo-600 hover:underline mt-2 inline-block">
              Back to Governance
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const canVote = proposal.status.toLowerCase() === 'active' && isConnected
  const canExecute = proposal.status.toLowerCase() === 'passed' && !proposal.executed && isConnected

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/governance" className="text-indigo-600 hover:underline">
            ← Back to Governance
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Proposal #{proposal.id}
              </h1>
              <p className="text-gray-600 mt-2">{proposal.proposalType}</p>
            </div>
            <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(proposal.status)}`}>
              {proposal.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{proposal.description}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Voting Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">For Votes</p>
                  <p className="text-2xl font-bold text-green-600">{proposal.forVotes}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Against Votes</p>
                  <p className="text-2xl font-bold text-red-600">{proposal.againstVotes}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Start Time</p>
                  <p className="text-lg">{new Date(proposal.startTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Time</p>
                  <p className="text-lg">{new Date(proposal.endTime).toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Proposer</p>
                  <p className="text-sm font-mono truncate">{proposal.proposer}</p>
                </div>
              </div>
            </div>

            <ProposalDiscussion proposalId={proposalId} />
          </div>

          {isConnected && (
            <div className="space-y-6">
              {canVote && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Cast Your Vote</h2>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleVote(true)}
                      disabled={voting || isVoting}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {voting || isVoting ? 'Voting...' : 'Vote For'}
                    </button>
                    <button
                      onClick={() => handleVote(false)}
                      disabled={voting || isVoting}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {voting || isVoting ? 'Voting...' : 'Vote Against'}
                    </button>
                  </div>
                </div>
              )}

              {canExecute && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Execute Proposal</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    This proposal has passed and can be executed.
                  </p>
                  <button
                    onClick={handleExecute}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Execute Proposal
                  </button>
                </div>
              )}

              {!canVote && !canExecute && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Voting Status</h2>
                  <p className="text-sm text-gray-600">
                    {proposal.executed
                      ? 'This proposal has been executed.'
                      : proposal.status.toLowerCase() === 'passed'
                      ? 'This proposal has passed but cannot be executed yet.'
                      : 'Voting is not available for this proposal.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

