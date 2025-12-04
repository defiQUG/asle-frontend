'use client'

import { useState, useEffect } from 'react'
import { AreaChart } from '@/components/charts/AreaChart'
import { PieChart } from '@/components/charts/PieChart'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function TreasuryPage() {
  const [treasury, setTreasury] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTreasury()
    fetchHistory()
  }, [])

  const fetchTreasury = async () => {
    try {
      // In production, fetch from GovernanceFacet
      setTreasury({
        ETH: '1000000000000000000', // 1 ETH
        USDC: '5000000000', // 5000 USDC
      })
    } catch (error) {
      console.error('Error fetching treasury:', error)
    }
  }

  const fetchHistory = async () => {
    try {
      // In production, fetch treasury transaction history
      setHistory([])
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  const treasuryData = treasury ? [
    { name: 'ETH', value: parseFloat(treasury.ETH || '0') / 1e18 },
    { name: 'USDC', value: parseFloat(treasury.USDC || '0') / 1e6 },
  ] : []

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Treasury Management</h1>
          <p className="mt-2 text-gray-600">View and manage treasury balances</p>
        </div>

        {/* Treasury Overview */}
        {treasury && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Treasury Balances</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">ETH:</span>
                  <span className="font-semibold">{(parseFloat(treasury.ETH) / 1e18).toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">USDC:</span>
                  <span className="font-semibold">{(parseFloat(treasury.USDC) / 1e6).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <PieChart
                data={treasuryData}
                title="Treasury Allocation"
              />
            </div>
          </div>
        )}

        {/* Treasury History */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
          {history.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No transactions yet</div>
          ) : (
            <div className="space-y-2">
              {history.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{tx.type}</span>
                    <span className="text-gray-500 ml-2">{tx.amount}</span>
                  </div>
                  <span className="text-sm text-gray-500">{new Date(tx.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

