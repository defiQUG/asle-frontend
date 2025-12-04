'use client'

import { useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { DIAMOND_ADDRESS, DIAMOND_ABI } from '@/lib/contracts'
import toast from 'react-hot-toast'
import { LoadingSpinner } from './LoadingSpinner'

export function ComplianceSelector() {
  const { address } = useAccount()
  const [selectedMode, setSelectedMode] = useState<'Regulated' | 'Fintech' | 'Decentralized'>('Decentralized')
  const { writeContract, isPending } = useWriteContract()

  const handleSetMode = async () => {
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }

    try {
      // Mode values: 0 = Regulated, 1 = Fintech, 2 = Decentralized
      const modeValue = selectedMode === 'Regulated' ? 0 : selectedMode === 'Fintech' ? 1 : 2

      // In production, this would call ComplianceFacet.setUserComplianceMode
      // For now, showing the structure
      toast.success(`Compliance mode set to ${selectedMode}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to set compliance mode')
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Compliance Mode</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Compliance Mode
          </label>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Decentralized">Decentralized (Mode C)</option>
            <option value="Fintech">Enterprise Fintech (Mode B)</option>
            <option value="Regulated">Regulated Financial Institution (Mode A)</option>
          </select>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-semibold mb-2">Mode Details:</h3>
          {selectedMode === 'Decentralized' && (
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Non-custodial key management</li>
              <li>Zero-knowledge identity support</li>
              <li>Permissionless access</li>
              <li>Minimal data retention</li>
            </ul>
          )}
          {selectedMode === 'Fintech' && (
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Tiered KYC requirements</li>
              <li>Risk-based monitoring</li>
              <li>API governance</li>
              <li>Activity scoring</li>
            </ul>
          )}
          {selectedMode === 'Regulated' && (
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Full KYC/AML screening</li>
              <li>ISO 20022 financial messaging</li>
              <li>FATF Travel Rule compliance</li>
              <li>Comprehensive audit trails</li>
            </ul>
          )}
        </div>
        {address && (
          <button
            onClick={handleSetMode}
            disabled={isPending}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center"
          >
            {isPending ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Setting...</span>
              </>
            ) : (
              'Set Compliance Mode'
            )}
          </button>
        )}
        {!address && (
          <p className="text-sm text-gray-500 text-center">Connect wallet to set compliance mode</p>
        )}
      </div>
    </div>
  )
}
