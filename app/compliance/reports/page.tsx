'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface SARReport {
  id: string
  reportId: string
  transactionHash: string
  userAddress: string
  amount: string
  reason: string
  status: string
  submittedAt?: string
  jurisdiction: string
  createdAt: string
}

interface CTRReport {
  id: string
  reportId: string
  transactionHash: string
  userAddress: string
  amount: string
  currency: string
  transactionType: string
  status: string
  submittedAt?: string
  jurisdiction: string
  createdAt: string
}

export default function ComplianceReportsPage() {
  const [activeTab, setActiveTab] = useState<'sar' | 'ctr'>('sar')
  const [sarReports, setSarReports] = useState<SARReport[]>([])
  const [ctrReports, setCtrReports] = useState<CTRReport[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [activeTab])

  const fetchReports = async () => {
    setLoading(true)
    try {
      if (activeTab === 'sar') {
        const response = await axios.get(`${API_URL}/api/compliance/reports/sar`)
        setSarReports(response.data)
      } else {
        const response = await axios.get(`${API_URL}/api/compliance/reports/ctr`)
        setCtrReports(response.data)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (reportId: string, type: 'sar' | 'ctr') => {
    try {
      await axios.post(`${API_URL}/api/compliance/reports/${type}/${reportId}/submit`)
      fetchReports()
    } catch (error) {
      console.error('Error submitting report:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'acknowledged':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Regulatory Reports</h1>
          <p className="mt-2 text-gray-600">Manage SAR and CTR reports</p>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('sar')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              SAR Reports ({sarReports.length})
            </button>
            <button
              onClick={() => setActiveTab('ctr')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ctr'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              CTR Reports ({ctrReports.length})
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading reports...</div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {activeTab === 'sar' ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sarReports.map((report) => (
                    <tr key={report.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{report.reportId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.userAddress.slice(0, 10)}...</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {report.status === 'draft' && (
                          <button
                            onClick={() => handleSubmit(report.id, 'sar')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Submit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ctrReports.map((report) => (
                    <tr key={report.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{report.reportId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.userAddress.slice(0, 10)}...</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.currency}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {report.status === 'draft' && (
                          <button
                            onClick={() => handleSubmit(report.id, 'ctr')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Submit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

