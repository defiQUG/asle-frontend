'use client'

import { useState, useEffect } from 'react'
import { LineChart } from '@/components/charts/LineChart'
import { BarChart } from '@/components/charts/BarChart'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function GovernanceAnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [trends, setTrends] = useState<any[]>([])
  const [delegates, setDelegates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [metricsRes, trendsRes, delegatesRes] = await Promise.all([
        axios.get(`${API_URL}/api/governance/analytics/metrics`),
        axios.get(`${API_URL}/api/governance/analytics/trends`),
        axios.get(`${API_URL}/api/governance/analytics/delegates`),
      ])
      setMetrics(metricsRes.data)
      setTrends(trendsRes.data)
      setDelegates(delegatesRes.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const trendsData = trends.map((t) => ({
    date: t.date,
    proposalsCreated: t.proposalsCreated,
    votesCast: t.votesCast,
    proposalsPassed: t.proposalsPassed,
  }))

  const delegatesData = delegates.map((d) => ({
    delegatee: d.delegatee.slice(0, 10) + '...',
    totalDelegated: parseFloat(d.totalDelegated || '0'),
    proposalsVoted: d.proposalsVoted,
    winRate: d.winRate,
  }))

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Governance Analytics</h1>
          <p className="mt-2 text-gray-600">Comprehensive governance metrics and insights</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading analytics...</div>
        ) : (
          <div className="space-y-6">
            {/* Metrics */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">Total Proposals</h3>
                  <p className="text-2xl font-bold mt-2">{metrics.totalProposals || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">Active Proposals</h3>
                  <p className="text-2xl font-bold mt-2">{metrics.activeProposals || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">Participation Rate</h3>
                  <p className="text-2xl font-bold mt-2">{metrics.participationRate?.toFixed(1) || 0}%</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-sm font-medium text-gray-500">Total Delegations</h3>
                  <p className="text-2xl font-bold mt-2">{metrics.totalDelegations || 0}</p>
                </div>
              </div>
            )}

            {/* Trends Chart */}
            {trendsData.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <LineChart
                  data={trendsData}
                  dataKey="date"
                  lines={[
                    { key: 'proposalsCreated', name: 'Proposals Created', color: '#3b82f6' },
                    { key: 'votesCast', name: 'Votes Cast', color: '#10b981' },
                    { key: 'proposalsPassed', name: 'Proposals Passed', color: '#f59e0b' },
                  ]}
                  title="Governance Trends"
                />
              </div>
            )}

            {/* Delegate Leaderboard */}
            {delegatesData.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Delegate Leaderboard</h2>
                <BarChart
                  data={delegatesData}
                  dataKey="delegatee"
                  bars={[
                    { key: 'totalDelegated', name: 'Total Delegated', color: '#3b82f6' },
                    { key: 'proposalsVoted', name: 'Proposals Voted', color: '#10b981' },
                  ]}
                  title="Top Delegates"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

