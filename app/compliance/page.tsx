'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ComplianceSelector } from '@/components/ComplianceSelector'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface ComplianceRecord {
  userAddress: string
  complianceMode: string
  kycVerified: boolean
  amlVerified: boolean
  kycProvider?: string
  amlProvider?: string
  lastKYCUpdate?: string
  lastAMLUpdate?: string
}

export default function CompliancePage() {
  const { address, isConnected } = useAccount()
  const [loading, setLoading] = useState(false)
  const [complianceRecord, setComplianceRecord] = useState<ComplianceRecord | null>(null)
  const [ofacCheck, setOfacCheck] = useState<{ sanctioned: boolean; timestamp: number } | null>(null)

  useEffect(() => {
    if (address) {
      fetchComplianceRecord()
      checkOFAC()
    }
  }, [address])

  const fetchComplianceRecord = async () => {
    if (!address) return
    try {
      const response = await api.get(`/compliance/record/${address}`)
      if (response.data.success) {
        setComplianceRecord(response.data.record)
      }
    } catch (error: any) {
      console.error('Error fetching compliance record:', error)
    }
  }

  const checkOFAC = async () => {
    if (!address) return
    try {
      const response = await api.post('/compliance/ofac/check', { userAddress: address })
      if (response.data.success) {
        setOfacCheck(response.data.result)
      }
    } catch (error: any) {
      console.error('Error checking OFAC:', error)
    }
  }

  const handleKYCVerification = async () => {
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/compliance/kyc/verify', {
        userAddress: address,
        provider: 'default'
      })
      if (response.data.success) {
        toast.success('KYC verification initiated')
        await fetchComplianceRecord()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'KYC verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleAMLVerification = async () => {
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/compliance/aml/verify', {
        userAddress: address,
        provider: 'default'
      })
      if (response.data.success) {
        toast.success('AML verification initiated')
        await fetchComplianceRecord()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'AML verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Compliance Management</h1>

        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">Please connect your wallet to view compliance status</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComplianceSelector />

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">KYC/AML Verification</h2>
            <div className="space-y-4">
              <button
                onClick={handleKYCVerification}
                disabled={loading || !address}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Verify KYC'}
              </button>
              {complianceRecord && (
                <div className={`p-3 rounded ${complianceRecord.kycVerified ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">KYC Status:</span>
                    <span className={`text-sm font-semibold ${complianceRecord.kycVerified ? 'text-green-600' : 'text-gray-600'}`}>
                      {complianceRecord.kycVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  {complianceRecord.kycProvider && (
                    <p className="text-xs text-gray-600">Provider: {complianceRecord.kycProvider}</p>
                  )}
                  {complianceRecord.lastKYCUpdate && (
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date(complianceRecord.lastKYCUpdate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={handleAMLVerification}
                disabled={loading || !address}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Verify AML'}
              </button>
              {complianceRecord && (
                <div className={`p-3 rounded ${complianceRecord.amlVerified ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">AML Status:</span>
                    <span className={`text-sm font-semibold ${complianceRecord.amlVerified ? 'text-green-600' : 'text-gray-600'}`}>
                      {complianceRecord.amlVerified ? 'Passed' : 'Pending'}
                    </span>
                  </div>
                  {complianceRecord.amlProvider && (
                    <p className="text-xs text-gray-600">Provider: {complianceRecord.amlProvider}</p>
                  )}
                  {complianceRecord.lastAMLUpdate && (
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date(complianceRecord.lastAMLUpdate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">OFAC Sanctions Check</h2>
            {ofacCheck ? (
              <div className={`p-4 rounded ${ofacCheck.sanctioned ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status:</span>
                  <span className={`font-semibold ${ofacCheck.sanctioned ? 'text-red-600' : 'text-green-600'}`}>
                    {ofacCheck.sanctioned ? 'SANCTIONED' : 'CLEAR'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Checked: {new Date(ofacCheck.timestamp).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Connect wallet to check OFAC status</p>
            )}
            <button
              onClick={checkOFAC}
              disabled={!address}
              className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Refresh Check
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Regulatory Features</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">ISO 20022 Messaging</span>
                <span className="text-green-600 text-sm font-semibold">Enabled</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">FATF Travel Rule</span>
                <span className="text-green-600 text-sm font-semibold">Enabled</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">OFAC Screening</span>
                <span className="text-green-600 text-sm font-semibold">Active</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm">Audit Trail</span>
                <span className="text-green-600 text-sm font-semibold">Recording</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Compliance Modes</h2>
            <div className="space-y-3">
              <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                <h3 className="font-semibold text-blue-900">Mode A: Regulated</h3>
                <p className="text-sm text-blue-700 mt-1">Full KYC/AML, ISO 20022, FATF Travel Rule</p>
                <ul className="text-xs text-blue-600 mt-2 list-disc list-inside">
                  <li>Complete identity verification</li>
                  <li>AML screening required</li>
                  <li>Travel Rule compliance</li>
                </ul>
              </div>
              <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
                <h3 className="font-semibold text-green-900">Mode B: Fintech</h3>
                <p className="text-sm text-green-700 mt-1">Tiered KYC, Risk-based monitoring</p>
                <ul className="text-xs text-green-600 mt-2 list-disc list-inside">
                  <li>Tiered verification levels</li>
                  <li>Risk-based AML checks</li>
                  <li>Transaction monitoring</li>
                </ul>
              </div>
              <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                <h3 className="font-semibold text-gray-900">Mode C: Decentralized</h3>
                <p className="text-sm text-gray-700 mt-1">Non-custodial, Permissionless</p>
                <ul className="text-xs text-gray-600 mt-2 list-disc list-inside">
                  <li>No KYC required</li>
                  <li>Fully permissionless</li>
                  <li>User-controlled assets</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
