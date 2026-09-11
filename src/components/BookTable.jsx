import React from 'react';
import LoadingSpinner from './LoadingSpinner.jsx';

export default function BookTable({
  headers = [],
  items = [],
  renderRow,
  emptyMessage = 'No records found',
  isLoading = false,
  loadingMessage = 'Loading books...',
  tableId,
}) {
  return (
    <div className="table-responsive">
      <table className="table table-dark table-hover mt-3">
        <thead>
          <tr>
            {headers.map((header, idx) => (
              <th key={idx}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody id={tableId}>
          {isLoading ? (
            <tr>
              <td colSpan={headers.length || 1} className="text-center">
                <LoadingSpinner message={loadingMessage} />
              </td>
            </tr>
          ) : items.length > 0 ? (
            items.map((item, index) => renderRow(item, index))
          ) : (
            <tr>
              <td colSpan={headers.length || 1} className="text-center">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
