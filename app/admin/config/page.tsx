'use client';

import { useEffect, useState } from 'react';

export default function AdminConfigPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch('/api/admin/config', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setConfigs(data);
    } catch (error) {
      console.error('Failed to fetch configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string) => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key,
          value: JSON.parse(editValue),
        }),
      });
      if (res.ok) {
        setEditingKey(null);
        fetchConfigs();
      }
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">System Configuration</h1>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {configs.map((config) => (
            <li key={config.key} className="px-4 py-4 sm:px-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{config.key}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {config.description || 'No description'}
                  </p>
                  {editingKey === config.key ? (
                    <textarea
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                  ) : (
                    <pre className="mt-2 text-xs bg-gray-50 p-2 rounded">
                      {JSON.stringify(config.value, null, 2)}
                    </pre>
                  )}
                </div>
                <div className="ml-4">
                  {editingKey === config.key ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSave(config.key)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingKey(null);
                          setEditValue('');
                        }}
                        className="text-gray-600 hover:text-gray-900 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingKey(config.key);
                        setEditValue(JSON.stringify(config.value, null, 2));
                      }}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

