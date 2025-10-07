import React from 'react';
import './DataVisualization.css';

interface DataVisualizationProps {
  data: any;
}

/**
 * Component for visualizing data in various formats
 */
export const DataVisualization: React.FC<DataVisualizationProps> = ({ data }) => {
  if (!data) {
    return null;
  }

  // Handle different data formats
  if (data.data && Array.isArray(data.data)) {
    return <DataTable data={data.data} metadata={data.metadata} />;
  } else if (Array.isArray(data)) {
    return <DataTable data={data} />;
  } else if (typeof data === 'object') {
    return <DataObject data={data} />;
  } else {
    return <DataText data={data} />;
  }
};

/**
 * Component for displaying data in a table format
 */
const DataTable: React.FC<{ data: any[]; metadata?: any }> = ({ data, metadata }) => {
  if (!data || data.length === 0) {
    return (
      <div className="data-visualization data-visualization--empty">
        <p>No data available</p>
      </div>
    );
  }

  // Get all unique keys from the data
  const keys = Array.from(
    new Set(data.flatMap(item => Object.keys(item)))
  );

  // Limit to first 10 rows for display
  const displayData = data.slice(0, 10);
  const hasMore = data.length > 10;

  return (
    <div className="data-visualization data-visualization--table">
      {metadata && (
        <div className="data-visualization__metadata">
          <span className="data-visualization__source">
            Source: {metadata.source || 'Unknown'}
          </span>
          <span className="data-visualization__count">
            {data.length} records
          </span>
        </div>
      )}
      
      <div className="data-visualization__table-container">
        <table className="data-visualization__table">
          <thead>
            <tr>
              {keys.map(key => (
                <th key={key} className="data-visualization__header">
                  {formatHeader(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((item, index) => (
              <tr key={index} className="data-visualization__row">
                {keys.map(key => (
                  <td key={key} className="data-visualization__cell">
                    {formatCellValue(item[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="data-visualization__more">
          <p>Showing first 10 of {data.length} records</p>
        </div>
      )}
    </div>
  );
};

/**
 * Component for displaying object data
 */
const DataObject: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="data-visualization data-visualization--object">
      <pre className="data-visualization__json">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

/**
 * Component for displaying text data
 */
const DataText: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="data-visualization data-visualization--text">
      <p>{String(data)}</p>
    </div>
  );
};

/**
 * Format header text for display
 */
const formatHeader = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

/**
 * Format cell value for display
 */
const formatCellValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '-';
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (typeof value === 'number') {
    // Format large numbers with commas
    if (value > 1000) {
      return value.toLocaleString();
    }
    return value.toString();
  }
  
  if (typeof value === 'string') {
    // Truncate long strings
    if (value.length > 50) {
      return value.substring(0, 47) + '...';
    }
    return value;
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return String(value);
};

