import React from 'react';
import './StatusBadge.css';

export default function StatusBadge({ status }) {
  const statusMap = {
    pending: { label: 'Pending', color: 'gray' },
    received: { label: 'Received', color: 'blue' },
    under_review: { label: 'Under Review', color: 'yellow' },
    citation_issued: { label: 'Citation Issued', color: 'green' },
    dismissed: { label: 'Dismissed', color: 'red' },
    insufficient_evidence: { label: 'Insufficient Evidence', color: 'orange' }
  };

  const { label, color } = statusMap[status] || { label: status, color: 'gray' };

  return (
    <span className={`status-badge status-badge--${color}`}>
      {label}
    </span>
  );
}
