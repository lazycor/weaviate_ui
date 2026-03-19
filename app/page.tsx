'use client';

import { useState } from 'react';
import ConnectionForm from './components/ConnectionForm';
import Sidebar from './components/Sidebar';
import ObjectsTable from './components/ObjectsTable';
import { WeaviateConnection } from './types';

export default function Home() {
  const [connection, setConnection] = useState<WeaviateConnection | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = (conn: WeaviateConnection) => {
    setConnection(conn);
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    setConnection(null);
    setIsConnected(false);
    setSelectedClass(null);
  };

  const handleClassSelect = (className: string) => {
    setSelectedClass(className);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ConnectionForm onConnect={handleConnect} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        connection={connection!}
        onClassSelect={handleClassSelect}
        selectedClass={selectedClass}
        onDisconnect={handleDisconnect}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {selectedClass ? (
          <ObjectsTable connection={connection!} className={selectedClass} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
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
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No class selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a class from the sidebar to view its documents
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
