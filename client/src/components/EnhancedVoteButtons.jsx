import React, { useState } from 'react';
import './EnhancedVoteButtons.css';

const EnhancedVoteButtons = ({
  voteData = {},
  userVotes = [],
  onVote,
  loading = false,
  disabled = false
}) => {
  const [selectedVotes, setSelectedVotes] = useState(userVotes);

  const voteOptions = [
    {
      id: 'confirmViolation',
      label: 'Confirm Violation',
      icon: '👍',
      color: 'green',
      description: 'This is a clear violation'
    },
    {
      id: 'notViolation',
      label: 'Not a Violation',
      icon: '👎',
      color: 'red',
      description: 'This does not appear to be a violation'
    },
    {
      id: 'veryDangerous',
      label: 'Very Dangerous',
      icon: '⚠️',
      color: 'orange',
      description: 'This behavior poses serious danger'
    },
    {
      id: 'sendToPolice',
      label: 'Send to Police Now',
      icon: '🚨',
      color: 'blue',
      description: 'Law enforcement should review immediately'
    },
    {
      id: 'needContext',
      label: 'Need More Context',
      icon: '❓',
      color: 'gray',
      description: 'More information needed to judge'
    }
  ];

  const toggleVote = (voteId) => {
    if (disabled || loading) return;

    const newSelectedVotes = selectedVotes.includes(voteId)
      ? selectedVotes.filter(v => v !== voteId)
      : [...selectedVotes, voteId];

    setSelectedVotes(newSelectedVotes);

    if (onVote) {
      onVote(newSelectedVotes);
    }
  };

  const getVoteCount = (voteId) => {
    return voteData?.voteTypes?.[voteId] || 0;
  };

  return (
    <div className="enhanced-vote-buttons">
      <h4>Community Voting</h4>
      <p className="vote-instructions">
        Select all that apply (multiple choices allowed)
      </p>

      <div className="vote-options">
        {voteOptions.map(option => {
          const isSelected = selectedVotes.includes(option.id);
          const count = getVoteCount(option.id);

          return (
            <button
              key={option.id}
              className={`vote-button vote-${option.color} ${isSelected ? 'selected' : ''}`}
              onClick={() => toggleVote(option.id)}
              disabled={disabled || loading}
              title={option.description}
            >
              <span className="vote-icon">{option.icon}</span>
              <span className="vote-label">{option.label}</span>
              {count > 0 && (
                <span className="vote-count">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="vote-loading">
          Submitting your votes...
        </div>
      )}
    </div>
  );
};

export default EnhancedVoteButtons;
