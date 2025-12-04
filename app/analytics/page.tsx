'use client'

import { useState, useEffect } from 'react'
import { PoolAnalytics } from '@/components/analytics/PoolAnalytics'
import { PortfolioTracker } from '@/components/analytics/PortfolioTracker'
import { PerformanceMetrics } from '@/components/analytics/PerformanceMetrics'
import { HistoricalCharts } from '@/components/analytics/HistoricalCharts'
import { RealTimeMetrics } from '@/components/analytics/RealTimeMetrics'
import { useAccount } from 'wagmi'

export default function AnalyticsPage() {
  const { address } = useAccount()
  const [activeTab, setActiveTab] = useState<'pools' | 'portfolio' | 'performance' | 'historical' | 'realtime'>('pools')

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">Comprehensive analytics and insights for ASLE platform</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'pools', label: 'Pool Analytics' },
              { id: 'portfolio', label: 'Portfolio' },
              { id: 'performance', label: 'Performance' },
              { id: 'historical', label: 'Historical Data' },
              { id: 'realtime', label: 'Real-Time' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'pools' && <PoolAnalytics />}
          {activeTab === 'portfolio' && <PortfolioTracker userAddress={address || ''} />}
          {activeTab === 'performance' && <PerformanceMetrics />}
          {activeTab === 'historical' && <HistoricalCharts />}
          {activeTab === 'realtime' && <RealTimeMetrics />}
        </div>
      </div>
    </div>
  )
}

