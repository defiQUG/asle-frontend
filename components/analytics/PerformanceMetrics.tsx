'use client'

import { useState, useEffect } from 'react'
import { LineChart } from '@/components/charts/LineChart'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/analytics/metrics`)
      setMetrics(response.data)
    } catch (error) {
      console.error('Error fetching performance metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        Loading performance metrics...
      </div>
    )
  }

  if (!metrics) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total TVL</h3>
          <p className="text-2xl font-bold mt-2">{parseFloat(metrics.totalTVL || '0').toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">24h Volume</h3>
          <p className="text-2xl font-bold mt-2">{parseFloat(metrics.totalVolume24h || '0').toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">24h Fees</h3>
          <p className="text-2xl font-bold mt-2">{parseFloat(metrics.totalFees24h || '0').toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Pools</h3>
          <p className="text-2xl font-bold mt-2">{metrics.activePools || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
          <p className="text-2xl font-bold mt-2">{metrics.activeUsers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">24h Transactions</h3>
          <p className="text-2xl font-bold mt-2">{metrics.transactionCount24h || 0}</p>
        </div>
      </div>
    </div>
  )
}

