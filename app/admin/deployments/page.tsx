'use client';

import { useEffect, useState } from 'react';

export default function AdminDeploymentsPage() {
  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeployment, setSelectedDeployment] = useState<any>(null);

  useEffect(() => {
    fetchDeployments();
  }, []);

  const fetchDeployments = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch('/api/admin/deployments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setDeployments(data);
    } catch (error) {
      console.error('Failed to fetch deployments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async (id: string) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`/api/admin/deployments/${id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'deploying' }),
      });
      if (res.ok) {
        fetchDeployments();
      }
    } catch (error) {
      console.error('Failed to deploy:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'deploying':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Deployments</h1>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {deployments.map((deployment) => (
            <li key={deployment.id} className="px-4 py-4 sm:px-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {deployment.name} - {deployment.environment}
                  </p>
                  <p className="text-sm text-gray-500">
                    Version: {deployment.version} | Created: {new Date(deployment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      deployment.status
                    )}`}
                  >
                    {deployment.status}
                  </span>
                  {deployment.status === 'pending' && (
                    <button
                      onClick={() => handleDeploy(deployment.id)}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Deploy
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedDeployment(deployment)}
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    View Logs
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {selectedDeployment && (
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Deployment Logs</h3>
          <div className="bg-gray-50 rounded p-4 max-h-96 overflow-y-auto">
            <pre className="text-xs">
              {JSON.stringify(selectedDeployment, null, 2)}
            </pre>
          </div>
          <button
            onClick={() => setSelectedDeployment(null)}
            className="mt-4 text-sm text-gray-600 hover:text-gray-900"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

