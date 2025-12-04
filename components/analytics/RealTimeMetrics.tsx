'use client'

import { useState, useEffect } from 'react'
import { useRealtimeData } from '@/hooks/useRealtimeData'
import { LineChart } from '@/components/charts/LineChart'

export function RealTimeMetrics() {
  const { data, connected } = useRealtimeData('metrics')
  const [metrics, setMetrics] = useState<any[]>([])

  useEffect(() => {
    if (data) {
      setMetrics((prev) => [...prev.slice(-50), data].slice(-50))
    }
  }, [data])

  const chartData = metrics.map((m, index) => ({
    time: index.toString(),
    tvl: parseFloat(m?.totalTVL || '0'),
    volume: parseFloat(m?.totalVolume24h || '0'),
  }))

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Real-Time Metrics</h2>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        {chartData.length > 0 && (
          <LineChart
            data={chartData}
            dataKey="time"
            lines={[
              { key: 'tvl', name: 'TVL', color: '#3b82f6' },
              { key: 'volume', name: 'Volume', color: '#10b981' },
            ]}
            title="Real-Time Metrics"
          />
        )}

        {metrics.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Waiting for real-time data...
          </div>
        )}
      </div>
    </div>
  )
}

