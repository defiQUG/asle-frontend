'use client'

import { useState, useEffect } from 'react'
import { LineChart } from '@/components/charts/LineChart'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export function HistoricalCharts() {
  const [poolId, setPoolId] = useState<string>('')
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchHistoricalData = async () => {
    if (!poolId) return
    setLoading(true)
    try {
      const endDate = new Date()
      const startDate = new Date()
      switch (period) {
        case 'day':
          startDate.setDate(startDate.getDate() - 7)
          break
        case 'week':
          startDate.setDate(startDate.getDate() - 30)
          break
        case 'month':
          startDate.setDate(startDate.getDate() - 90)
          break
      }

      const response = await axios.get(`${API_URL}/api/analytics/historical`, {
        params: {
          poolId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          period,
        },
      })
      setData(response.data)
    } catch (error) {
      console.error('Error fetching historical data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (poolId) {
      fetchHistoricalData()
    }
  }, [poolId, period])

  const chartData = data.map((d) => ({
    date: typeof d.timestamp === 'string' ? new Date(d.timestamp).toLocaleDateString() : d.timestamp,
    value: typeof d.value === 'string' ? parseFloat(d.value) : d.value,
  }))

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={poolId}
            onChange={(e) => setPoolId(e.target.value)}
            placeholder="Enter Pool ID"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
          />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
          <button
            onClick={fetchHistoricalData}
            disabled={loading || !poolId}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load'}
          </button>
        </div>

        {chartData.length > 0 && (
          <LineChart
            data={chartData}
            dataKey="date"
            lines={[{ key: 'value', name: 'TVL', color: '#3b82f6' }]}
            title="Historical TVL"
          />
        )}
      </div>
    </div>
  )
}

