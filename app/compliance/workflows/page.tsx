'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface Workflow {
  id: string
  name: string
  description: string
  steps: any[]
  active: boolean
}

interface WorkflowExecution {
  id: string
  workflowId: string
  userAddress: string
  currentStep: number
  status: string
  results: any
  createdAt: string
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchWorkflows()
    fetchExecutions()
  }, [])

  const fetchWorkflows = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/compliance/workflows`)
      setWorkflows(response.data)
    } catch (error) {
      console.error('Error fetching workflows:', error)
    }
  }

  const fetchExecutions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/compliance/workflows/executions`)
      setExecutions(response.data)
    } catch (error) {
      console.error('Error fetching executions:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Compliance Workflows</h1>
          <p className="mt-2 text-gray-600">Manage automated compliance workflows</p>
        </div>

        {/* Workflows */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Workflow Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{workflow.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${workflow.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {workflow.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{workflow.description}</p>
                <div className="text-sm text-gray-500">
                  {workflow.steps?.length || 0} steps
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Executions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Workflow Executions</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workflow</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Step</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {executions.map((execution) => (
                  <tr key={execution.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{execution.workflowId.slice(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{execution.userAddress.slice(0, 10)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{execution.currentStep}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(execution.status)}`}>
                        {execution.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(execution.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

