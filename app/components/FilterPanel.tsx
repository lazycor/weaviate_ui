'use client';

import { useState } from 'react';
import { Filter } from '../types';

interface FilterPanelProps {
  filters: Filter[];
  onFiltersChange: (filters: Filter[]) => void;
  onApply: () => void;
}

export default function FilterPanel({ filters, onFiltersChange, onApply }: FilterPanelProps) {
  const [key, setKey] = useState('');
  const [operator, setOperator] = useState('Equal');
  const [value, setValue] = useState('');

  const operators = [
    'Equal',
    'NotEqual',
    'GreaterThan',
    'GreaterThanEqual',
    'LessThan',
    'LessThanEqual',
    'Like',
  ];

  const handleAddFilter = () => {
    if (!key || !value) return;

    const newFilter: Filter = {
      key,
      operator,
      value,
    };

    onFiltersChange([...filters, newFilter]);
    setKey('');
    setValue('');
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Advanced Filters</h3>

      <div className="grid grid-cols-12 gap-2">
        {/* Property Key */}
        <div className="col-span-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Property Key
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="e.g., title, content"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Operator */}
        <div className="col-span-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Operator
          </label>
          <select
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            {operators.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </div>

        {/* Value */}
        <div className="col-span-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Value
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Filter value"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleAddFilter()}
          />
        </div>

        {/* Add Button */}
        <div className="col-span-1 flex items-end">
          <button
            onClick={handleAddFilter}
            disabled={!key || !value}
            className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            +
          </button>
        </div>
      </div>

      {/* Filter Tips */}
      <div className="mt-3 text-xs text-gray-600">
        <p className="flex items-center gap-1">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Add multiple filters to combine them with AND logic
        </p>
      </div>

      {/* Applied Filters List */}
      {filters.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-300">
          <div className="text-xs font-medium text-gray-700 mb-2">
            Applied Filters ({filters.length})
          </div>
          <div className="space-y-2">
            {filters.map((filter, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-200"
              >
                <span className="text-sm text-gray-700">
                  <span className="font-medium">{filter.key}</span>
                  <span className="mx-2 text-gray-500">{filter.operator}</span>
                  <span className="font-medium">{filter.value}</span>
                </span>
                <button
                  onClick={() => {
                    const newFilters = filters.filter((_, i) => i !== index);
                    onFiltersChange(newFilters);
                  }}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
