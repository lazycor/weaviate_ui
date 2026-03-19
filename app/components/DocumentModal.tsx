'use client';

import { WeaviateObject } from '../types';

interface DocumentModalProps {
  object: WeaviateObject;
  onClose: () => void;
}

export default function DocumentModal({ object, onClose }: DocumentModalProps) {
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Document Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* ID */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">ID</h3>
            <div className="bg-gray-50 px-4 py-2 rounded border border-gray-200">
              <code className="text-sm font-mono text-gray-800">{object.id}</code>
            </div>
          </div>

          {/* Properties */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Properties</h3>
            <div className="bg-gray-50 rounded border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {Object.entries(object.properties).map(([key, value]) => (
                  <div key={key} className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">{key}</div>
                    <div className="text-sm text-gray-900">
                      {typeof value === 'object' ? (
                        <pre className="bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                          <code>{formatValue(value)}</code>
                        </pre>
                      ) : (
                        <div className="bg-white px-3 py-2 rounded border border-gray-200">
                          {formatValue(value)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vector (if available) */}
          {object.vector && object.vector.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Vector (dimensions: {object.vector.length})
              </h3>
              <div className="bg-gray-50 px-4 py-3 rounded border border-gray-200">
                <details>
                  <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                    Show vector values
                  </summary>
                  <pre className="mt-2 text-xs font-mono text-gray-700 overflow-x-auto">
                    {JSON.stringify(object.vector, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}

          {/* Raw JSON */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Raw JSON</h3>
            <div className="bg-gray-50 rounded border border-gray-200">
              <pre className="p-4 text-xs font-mono text-gray-700 overflow-x-auto">
                {JSON.stringify(object, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
