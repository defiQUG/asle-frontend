'use client'

import { useState, useEffect } from 'react'
import { AreaChart } from '@/components/charts/AreaChart'
import { PieChart } from '@/components/charts/PieChart'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface PortfolioTrackerProps {
  userAddress: string
}

export function PortfolioTracker({ userAddress }: PortfolioTrackerProps) {
  const [portfolio, setPortfolio] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userAddress) {
      fetchPortfolio()
      fetchHistory()
    }
  }, [userAddress])

  const fetchPortfolio = async () => {
    if (!userAddress) return
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/api/analytics/portfolio/${userAddress}`)
      setPortfolio(response.data)
    } catch (error) {
      console.error('Error fetching portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    if (!userAddress) return
    try {
      const response = await axios.get(`${API_URL}/api/analytics/portfolio/${userAddress}`, {
        params: {
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      })
      setHistory(Array.isArray(response.data) ? response.data : [response.data])
    } catch (error) {
      console.error('Error fetching portfolio history:', error)
    }
  }

  if (!userAddress) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
        Please connect your wallet to view your portfolio
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        Loading portfolio...
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
        No portfolio data available
      </div>
    )
  }

  const historyData = history.map((h) => ({
    date: new Date(h.timestamp).toLocaleDateString(),
    value: parseFloat(h.totalValue || '0'),
  }))

  const poolPositions = Object.values(portfolio.poolPositions || {}).map((pos: any) => ({
    name: `Pool ${pos.poolId}`,
    value: parseFloat(pos.value || '0'),
  }))

  const vaultPositions = Object.values(portfolio.vaultPositions || {}).map((vault: any) => ({
    name: `Vault ${vault.vaultId}`,
    value: parseFloat(vault.value || '0'),
  }))

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Portfolio Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
            <p className="text-3xl font-bold mt-2">{parseFloat(portfolio.totalValue || '0').toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Pool Positions</h3>
            <p className="text-3xl font-bold mt-2">{Object.keys(portfolio.poolPositions || {}).length}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Vault Positions</h3>
            <p className="text-3xl font-bold mt-2">{Object.keys(portfolio.vaultPositions || {}).length}</p>
          </div>
        </div>
      </div>

      {/* Portfolio Value History */}
      {historyData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <AreaChart
            data={historyData}
            dataKey="date"
            areas={[{ key: 'value', name: 'Portfolio Value', color: '#3b82f6' }]}
            title="Portfolio Value Over Time"
          />
        </div>
      )}

      {/* Asset Allocation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {poolPositions.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <PieChart
              data={poolPositions}
              title="Pool Positions"
            />
          </div>
        )}
        {vaultPositions.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <PieChart
              data={vaultPositions}
              title="Vault Positions"
            />
          </div>
        )}
      </div>
    </div>
  )
}

