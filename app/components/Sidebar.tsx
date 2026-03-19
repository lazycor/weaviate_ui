'use client';

import { useEffect, useState } from 'react';
import { WeaviateConnection } from '../types';

interface SidebarProps {
  connection: WeaviateConnection;
  onClassSelect: (className: string) => void;
  selectedClass: string | null;
  onDisconnect: () => void;
}

export default function Sidebar({
  connection,
  onClassSelect,
  selectedClass,
  onDisconnect,
}: SidebarProps) {
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/weaviate/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: connection.url,
          apiKey: connection.apiKey,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setClasses(data.classes);
      } else {
        setError(data.error || 'Failed to fetch classes');
      }
    } catch (err) {
      setError('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Weaviate UI
        </h2>
        <p className="text-xs text-gray-500 truncate" title={connection.url}>
          {connection.url}
        </p>
      </div>

      {/* Classes List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-sm">Loading classes...</p>
          </div>
        ) : error ? (
          <div className="p-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
            <button
              onClick={fetchClasses}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Retry
            </button>
          </div>
        ) : classes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No classes found</p>
          </div>
        ) : (
          <div className="p-2">
            <div className="mb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Classes ({classes.length})
            </div>
            {classes.map((className) => (
              <button
                key={className}
                onClick={() => onClassSelect(className)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition mb-1 ${
                  selectedClass === className
                    ? 'bg-blue-100 text-blue-900 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {className}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer with Disconnect button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onDisconnect}
          className="w-full px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition border border-red-200"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
