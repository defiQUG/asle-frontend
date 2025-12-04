'use client'

import { useState, useEffect } from 'react'
import { LineChart } from '@/components/charts/LineChart'
import { BarChart } from '@/components/charts/BarChart'
import { PieChart } from '@/components/charts/PieChart'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export function PoolAnalytics() {
  const [poolId, setPoolId] = useState<string>('')
  const [analytics, setAnalytics] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [systemMetrics, setSystemMetrics] = useState<any>(null)

  useEffect(() => {
    fetchSystemMetrics()
  }, [])

  const fetchSystemMetrics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/analytics/metrics`)
      setSystemMetrics(response.data)
    } catch (error) {
      console.error('Error fetching system metrics:', error)
    }
  }

  const fetchPoolAnalytics = async () => {
    if (!poolId) return
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/api/analytics/pools`, {
        params: { poolId },
      })
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching pool analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = analytics.map((a) => ({
    date: new Date(a.timestamp).toLocaleDateString(),
    tvl: parseFloat(a.tvl || '0'),
    volume24h: parseFloat(a.volume24h || '0'),
    fees24h: parseFloat(a.fees24h || '0'),
  }))

  return (
    <div className="space-y-6">
      {/* System Metrics */}
      {systemMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total TVL</h3>
            <p className="text-2xl font-bold mt-2">{parseFloat(systemMetrics.totalTVL || '0').toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">24h Volume</h3>
            <p className="text-2xl font-bold mt-2">{parseFloat(systemMetrics.totalVolume24h || '0').toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Pools</h3>
            <p className="text-2xl font-bold mt-2">{systemMetrics.activePools || 0}</p>
          </div>
        </div>
      )}

      {/* Pool Selector */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex gap-4">
          <input
            type="text"
            value={poolId}
            onChange={(e) => setPoolId(e.target.value)}
            placeholder="Enter Pool ID"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={fetchPoolAnalytics}
            disabled={loading || !poolId}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load Analytics'}
          </button>
        </div>
      </div>

      {/* Charts */}
      {analytics.length > 0 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <LineChart
              data={chartData}
              dataKey="date"
              lines={[
                { key: 'tvl', name: 'TVL', color: '#3b82f6' },
                { key: 'volume24h', name: '24h Volume', color: '#10b981' },
              ]}
              title="TVL and Volume Trends"
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <BarChart
              data={chartData}
              dataKey="date"
              bars={[{ key: 'fees24h', name: '24h Fees', color: '#f59e0b' }]}
              title="Fee Revenue"
            />
          </div>

          {analytics[0] && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <PieChart
                  data={[
                    { name: 'Base Reserve', value: parseFloat(analytics[0].tvl || '0') * 0.5 },
                    { name: 'Quote Reserve', value: parseFloat(analytics[0].tvl || '0') * 0.5 },
                  ]}
                  title="Reserve Distribution"
                />
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Pool Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utilization Rate:</span>
                    <span className="font-semibold">{(analytics[0].utilizationRate * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">7d Volume:</span>
                    <span className="font-semibold">{parseFloat(analytics[0].volume7d || '0').toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">30d Volume:</span>
                    <span className="font-semibold">{parseFloat(analytics[0].volume30d || '0').toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

