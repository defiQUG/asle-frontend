'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface ScreeningResult {
  id: string
  address: string
  riskScore: number
  sanctions: boolean
  passed: boolean
  providers: string[]
  action: string
  timestamp: string
}

export default function ScreeningPage() {
  const [address, setAddress] = useState('')
  const [results, setResults] = useState<ScreeningResult[]>([])
  const [loading, setLoading] = useState(false)
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    fetchMetrics()
    fetchRecentResults()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/compliance/analytics/metrics`)
      setMetrics(response.data)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }

  const fetchRecentResults = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/compliance/screening/recent`)
      setResults(response.data)
    } catch (error) {
      console.error('Error fetching results:', error)
    }
  }

  const handleScreen = async () => {
    if (!address) return
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/compliance/screening/screen`, {
        address,
      })
      setResults([response.data, ...results])
      setAddress('')
      fetchMetrics()
    } catch (error) {
      console.error('Error screening address:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 70) return 'text-red-600'
    if (riskScore >= 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'block':
        return 'bg-red-100 text-red-800'
      case 'review':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Real-Time Screening</h1>
          <p className="mt-2 text-gray-600">Screen addresses for sanctions and risk</p>
        </div>

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">24h Screenings</h3>
              <p className="text-2xl font-bold mt-2">{metrics.screeningVolume24h || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Sanctions Detected</h3>
              <p className="text-2xl font-bold mt-2">{metrics.totalSanctionsDetected || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Avg Risk Score</h3>
              <p className="text-2xl font-bold mt-2">{metrics.averageRiskScore?.toFixed(1) || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Compliance Rate</h3>
              <p className="text-2xl font-bold mt-2">{metrics.complianceRate?.toFixed(1) || 0}%</p>
            </div>
          </div>
        )}

        {/* Screening Input */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address to screen"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={handleScreen}
              disabled={loading || !address}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Screening...' : 'Screen Address'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sanctions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Providers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result) => (
                <tr key={result.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{result.address.slice(0, 10)}...</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getRiskColor(result.riskScore)}`}>
                    {result.riskScore.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {result.sanctions ? (
                      <span className="text-red-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-green-600">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(result.action)}`}>
                      {result.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {result.providers.join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(result.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

