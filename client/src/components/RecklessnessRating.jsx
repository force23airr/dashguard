import React, { useState, useEffect } from 'react';
import './RecklessnessRating.css';

const RecklessnessRating = ({
  average = 0,
  count = 0,
  userRating = null,
  onRate,
  loading = false,
  disabled = false
}) => {
  const [selectedRating, setSelectedRating] = useState(userRating || 5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userRating) {
      setSelectedRating(userRating);
    }
  }, [userRating]);

  const handleRatingChange = (e) => {
    setSelectedRating(parseInt(e.target.value));
  };

  const handleSubmit = async () => {
    if (disabled || loading || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onRate(selectedRating);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (rating) => {
    if (rating <= 2) return 'Minor';
    if (rating <= 4) return 'Moderate';
    if (rating <= 7) return 'Severe';
    return 'Extreme';
  };

  const getRatingColor = (rating) => {
    if (rating <= 2) return '#fbbf24'; // yellow
    if (rating <= 4) return '#f97316'; // orange
    if (rating <= 7) return '#ef4444'; // red
    return '#991b1b'; // dark red
  };

  return (
    <div className="recklessness-rating">
      <h4>Recklessness Rating</h4>

      {/* Community Average Display */}
      {count > 0 && (
        <div className="rating-average">
          <div className="average-score" style={{ color: getRatingColor(average) }}>
            {average.toFixed(1)}
            <span className="average-max">/10</span>
          </div>
          <div className="average-info">
            Community average from {count.toLocaleString()} {count === 1 ? 'rating' : 'ratings'}
          </div>
        </div>
      )}

      {/* User Rating Slider */}
      <div className="rating-slider-container">
        <div className="rating-slider-header">
          <span className="rating-prompt">Rate this behavior:</span>
          <span className="rating-value" style={{ color: getRatingColor(selectedRating) }}>
            {selectedRating} - {getRatingLabel(selectedRating)}
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="10"
          value={selectedRating}
          onChange={handleRatingChange}
          disabled={disabled || isSubmitting}
          className="rating-slider"
          style={{
            background: `linear-gradient(to right,
              #fbbf24 0%,
              #f97316 40%,
              #ef4444 70%,
              #991b1b 100%)`
          }}
        />

        <div className="rating-scale">
          <span>1 (Minor)</span>
          <span>10 (Extreme)</span>
        </div>

        <button
          className="rating-submit-btn"
          onClick={handleSubmit}
          disabled={disabled || isSubmitting || selectedRating === userRating}
        >
          {isSubmitting ? 'Submitting...' : userRating ? 'Update Rating' : 'Submit Rating'}
        </button>
      </div>

      {userRating && (
        <div className="user-rating-note">
          You rated this: <strong>{userRating}/10</strong>
        </div>
      )}
    </div>
  );
};

export default RecklessnessRating;
