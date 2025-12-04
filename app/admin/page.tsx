'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    
    // Fetch dashboard stats
    Promise.all([
      fetch('/api/pools').then((r) => r.json()),
      fetch('/api/vaults').then((r) => r.json()),
      fetch('/api/compliance').then((r) => r.json()),
    ])
      .then(([pools, vaults, compliance]) => {
        setStats({
          pools: Array.isArray(pools) ? pools.length : 0,
          vaults: Array.isArray(vaults) ? vaults.length : 0,
          complianceRecords: Array.isArray(compliance) ? compliance.length : 0,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of platform statistics and system health
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">P</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Pools
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.pools || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">V</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Vaults
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.vaults || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">C</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Compliance Records
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats?.complianceRecords || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/admin/users"
            className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition"
          >
            <h3 className="font-medium text-gray-900">Manage Users</h3>
            <p className="text-sm text-gray-500 mt-1">
              View and manage admin users
            </p>
          </a>
          <a
            href="/admin/config"
            className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition"
          >
            <h3 className="font-medium text-gray-900">System Config</h3>
            <p className="text-sm text-gray-500 mt-1">
              Configure system settings
            </p>
          </a>
          <a
            href="/admin/deployments"
            className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition"
          >
            <h3 className="font-medium text-gray-900">Deployments</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage deployments and rollbacks
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}

