import React from 'react';
import './ChainOfCustodyTimeline.css';

const ChainOfCustodyTimeline = ({ chainOfCustody = [] }) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action) => {
    const icons = {
      created: '📝',
      evidence_added: '📎',
      evidence_verified: '✅',
      exported: '📦',
      submitted_to_police: '👮',
      submitted_to_insurance: '🏢',
      reviewed: '🔍',
      status_changed: '🔄',
      accessed: '👁️'
    };
    return icons[action] || '•';
  };

  const getActionLabel = (action) => {
    const labels = {
      created: 'Report Created',
      evidence_added: 'Evidence Added',
      evidence_verified: 'Evidence Verified',
      exported: 'Evidence Package Exported',
      submitted_to_police: 'Submitted to Police',
      submitted_to_insurance: 'Submitted to Insurance',
      reviewed: 'Reviewed',
      status_changed: 'Status Changed',
      accessed: 'Accessed'
    };
    return labels[action] || action.replace(/_/g, ' ');
  };

  if (!chainOfCustody || chainOfCustody.length === 0) {
    return (
      <div className="chain-of-custody-timeline">
        <h3>Chain of Custody</h3>
        <p className="no-entries">No custody entries yet</p>
      </div>
    );
  }

  return (
    <div className="chain-of-custody-timeline">
      <h3>Chain of Custody</h3>
      <p className="timeline-description">
        Complete audit trail for court admissibility
      </p>

      <div className="timeline">
        {chainOfCustody.map((entry, index) => (
          <div key={index} className="timeline-entry">
            <div className="timeline-marker">
              <span className="marker-icon">{getActionIcon(entry.action)}</span>
              <div className="marker-line"></div>
            </div>

            <div className="timeline-content">
              <div className="entry-header">
                <h4 className="entry-action">{getActionLabel(entry.action)}</h4>
                <span className="entry-timestamp">{formatTimestamp(entry.timestamp)}</span>
              </div>

              {entry.details && (
                <p className="entry-details">{entry.details}</p>
              )}

              <div className="entry-metadata">
                {entry.entryHash && (
                  <div className="entry-hash" title={entry.entryHash}>
                    <span className="hash-label">Hash:</span>
                    <code className="hash-value">
                      {entry.entryHash.substring(0, 16)}...
                    </code>
                  </div>
                )}
                {entry.ipAddress && (
                  <div className="entry-ip">
                    <span className="ip-label">IP:</span>
                    <code className="ip-value">{entry.ipAddress}</code>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="integrity-badge">
        <span className="badge-icon">🔒</span>
        <span className="badge-text">Cryptographically Verified</span>
      </div>
    </div>
  );
};

export default ChainOfCustodyTimeline;
