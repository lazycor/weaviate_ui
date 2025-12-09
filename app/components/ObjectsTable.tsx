'use client';

import { useEffect, useState } from 'react';
import { WeaviateConnection, WeaviateObject, Filter } from '../types';
import DocumentModal from './DocumentModal';
import FilterPanel from './FilterPanel';

interface ObjectsTableProps {
  connection: WeaviateConnection;
  className: string;
}

export default function ObjectsTable({ connection, className }: ObjectsTableProps) {
  const [objects, setObjects] = useState<WeaviateObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<Filter[]>([]);
  const [selectedObject, setSelectedObject] = useState<WeaviateObject | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  useEffect(() => {
    fetchObjects();
  }, [className]);

  const fetchObjects = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/weaviate/objects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: connection.url,
          apiKey: connection.apiKey,
          className,
          limit: 100,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setObjects(data.objects);
      } else {
        setError(data.error || 'Failed to fetch objects');
      }
    } catch (err) {
      setError('Failed to fetch objects');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchText.trim() && filters.length === 0) {
      fetchObjects();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/weaviate/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: connection.url,
          apiKey: connection.apiKey,
          className,
          searchText: searchText.trim() || undefined,
          filters: filters.length > 0 ? filters : undefined,
          limit: 100,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setObjects(data.objects);
      } else {
        setError(data.error || 'Failed to search objects');
      }
    } catch (err) {
      setError('Failed to search objects');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
    setFilters([]);
    fetchObjects();
  };

  const getPropertyColumns = () => {
    if (objects.length === 0) return [];
    const allKeys = new Set<string>();
    objects.forEach(obj => {
      Object.keys(obj.properties).forEach(key => allKeys.add(key));
    });
    return Array.from(allKeys);
  };

  const renderCellValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...';
    }
    return String(value);
  };

  const columns = getPropertyColumns();

  return (
    <div className="flex flex-col h-full">
      {/* Header with Search */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{className}</h1>
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            {showFilterPanel ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search with plain text..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
          >
            Search
          </button>
          {(searchText || filters.length > 0) && (
            <button
              onClick={handleClearSearch}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilterPanel && (
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            onApply={handleSearch}
          />
        )}

        {/* Active Filters Display */}
        {filters.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.map((filter, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {filter.key} {filter.operator} {filter.value}
                <button
                  onClick={() => {
                    const newFilters = filters.filter((_, i) => i !== index);
                    setFilters(newFilters);
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading objects...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
              <button
                onClick={fetchObjects}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : objects.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
              <p className="mt-1 text-sm text-gray-500">
                This class doesn't contain any documents yet
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    {columns.map((column) => (
                      <th
                        key={column}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {objects.map((obj) => (
                    <tr key={obj.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {obj.id.substring(0, 8)}...
                      </td>
                      {columns.map((column) => (
                        <td
                          key={column}
                          className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate"
                        >
                          {renderCellValue(obj.properties[column])}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedObject(obj)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Document Modal */}
      {selectedObject && (
        <DocumentModal
          object={selectedObject}
          onClose={() => setSelectedObject(null)}
        />
      )}
    </div>
  );
}
