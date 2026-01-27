import React from 'react';
import './ViolationTypeGrid.css';

const ViolationTypeGrid = ({ selectedType, onSelect }) => {
  const violationTypes = [
    { value: 'running_red_light', label: 'Running Red Light', icon: '🚦', category: 'signals' },
    { value: 'running_stop_sign', label: 'Running Stop Sign', icon: '🛑', category: 'signals' },
    { value: 'speeding', label: 'Speeding', icon: '⚡', category: 'speed' },
    { value: 'reckless_driving', label: 'Reckless Driving', icon: '💥', category: 'dangerous' },
    { value: 'aggressive_driving', label: 'Aggressive Driving', icon: '😠', category: 'dangerous' },
    { value: 'tailgating', label: 'Tailgating', icon: '🚗', category: 'following' },
    { value: 'illegal_lane_change', label: 'Illegal Lane Change', icon: '↔️', category: 'lane' },
    { value: 'failure_to_signal', label: 'Failure to Signal', icon: '⚠️', category: 'lane' },
    { value: 'hit_and_run', label: 'Hit and Run', icon: '🏃', category: 'dangerous' },
    { value: 'dui_suspected', label: 'Suspected DUI', icon: '🍺', category: 'impaired' },
    { value: 'texting_while_driving', label: 'Texting While Driving', icon: '📱', category: 'distracted' },
    { value: 'distracted_driving', label: 'Distracted Driving', icon: '👀', category: 'distracted' },
    { value: 'wrong_way_driving', label: 'Wrong Way Driving', icon: '🔄', category: 'dangerous' },
    { value: 'street_racing', label: 'Street Racing', icon: '🏁', category: 'speed' },
    { value: 'road_rage', label: 'Road Rage', icon: '😡', category: 'dangerous' },
    { value: 'failure_to_yield', label: 'Failure to Yield', icon: '⚠️', category: 'right-of-way' },
    { value: 'illegal_turn', label: 'Illegal Turn', icon: '↩️', category: 'turning' },
    { value: 'illegal_u_turn', label: 'Illegal U-Turn', icon: '↪️', category: 'turning' },
    { value: 'other', label: 'Other Violation', icon: '❗', category: 'other' }
  ];

  return (
    <div className="violation-type-grid">
      {violationTypes.map(type => (
        <button
          key={type.value}
          className={`violation-type-card ${selectedType === type.value ? 'selected' : ''}`}
          onClick={() => onSelect(type.value)}
          type="button"
        >
          <div className="violation-icon">{type.icon}</div>
          <div className="violation-label">{type.label}</div>
        </button>
      ))}
    </div>
  );
};

export default ViolationTypeGrid;
