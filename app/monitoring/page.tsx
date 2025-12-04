'use client'

import { useState, useEffect } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface Alert {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  timestamp: number
  resolved: boolean
}

interface Metric {
  name: string
  value: number
  timestamp: number
}

export default function MonitoringPage() {
  const [health, setHealth] = useState<any>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<string>('')

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchHealth(),
        fetchAlerts(),
        fetchMetrics()
      ])
    } catch (error) {
      console.error('Error fetching monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHealth = async () => {
    try {
      const response = await api.get('/monitoring/health')
      if (response.data.success) {
        setHealth(response.data.health)
      }
    } catch (error: any) {
      console.error('Failed to fetch health:', error)
    }
  }

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/monitoring/alerts', {
        params: { resolved: false }
      })
      if (response.data.success) {
        setAlerts(response.data.alerts || [])
      }
    } catch (error: any) {
      console.error('Failed to fetch alerts:', error)
    }
  }

  const fetchMetrics = async () => {
    try {
      const timeRange = {
        from: Date.now() - 24 * 60 * 60 * 1000, // Last 24 hours
        to: Date.now()
      }
      const response = await api.get('/monitoring/metrics', {
        params: selectedMetric ? { name: selectedMetric, ...timeRange } : timeRange
      })
      if (response.data.success) {
        setMetrics(response.data.metrics || [])
      }
    } catch (error: any) {
      console.error('Failed to fetch metrics:', error)
    }
  }

  const handleResolveAlert = async (alertId: string) => {
    try {
      const response = await api.post(`/monitoring/alerts/${alertId}/resolve`)
      if (response.data.success) {
        toast.success('Alert resolved')
        await fetchAlerts()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resolve alert')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600'
      case 'degraded':
        return 'text-yellow-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50'
      case 'high':
        return 'border-orange-500 bg-orange-50'
      case 'medium':
        return 'border-yellow-500 bg-yellow-50'
      default:
        return 'border-blue-500 bg-blue-50'
    }
  }

  // Prepare metrics data for charts
  const metricsChartData = metrics.slice(0, 20).map(m => ({
    time: new Date(m.timestamp).toLocaleTimeString(),
    value: m.value
  }))

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-2">System Status</h2>
                <p className={`text-3xl font-bold ${getStatusColor(health?.status)}`}>
                  {health?.status?.toUpperCase() || 'UNKNOWN'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-2">Active Alerts</h2>
                <p className="text-3xl font-bold text-red-600">
                  {alerts.filter(a => !a.resolved).length}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {alerts.filter(a => a.severity === 'critical').length} critical
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-2">Components</h2>
                <p className="text-3xl font-bold text-green-600">
                  {health?.components ? Object.keys(health.components).length : 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {health?.components ? Object.values(health.components).filter((c: any) => c.status === 'up').length : 0} operational
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Component Status</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {health?.components && Object.entries(health.components).map(([name, comp]: [string, any]) => (
                  <div key={name} className="p-4 border-2 rounded-lg text-center">
                    <p className="font-semibold capitalize mb-2">{name}</p>
                    <div className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                      comp.status === 'up' ? 'bg-green-100 text-green-800' :
                      comp.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {comp.status.toUpperCase()}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(comp.lastCheck).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {metricsChartData.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Metrics</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metricsChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Alerts</h2>
                <select
                  value={selectedMetric}
                  onChange={(e) => {
                    setSelectedMetric(e.target.value)
                    fetchMetrics()
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Metrics</option>
                  <option value="transaction_count">Transactions</option>
                  <option value="volume">Volume</option>
                  <option value="errors">Errors</option>
                </select>
              </div>
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No alerts</p>
                ) : (
                  alerts.slice(0, 10).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border-l-4 rounded ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{alert.title}</p>
                          <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                        </div>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            alert.severity === 'critical' ? 'bg-red-200 text-red-900' :
                            alert.severity === 'high' ? 'bg-orange-200 text-orange-900' :
                            alert.severity === 'medium' ? 'bg-yellow-200 text-yellow-900' :
                            'bg-blue-200 text-blue-900'
                          }`}>
                            {alert.severity}
                          </span>
                          {!alert.resolved && (
                            <button
                              onClick={() => handleResolveAlert(alert.id)}
                              className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
