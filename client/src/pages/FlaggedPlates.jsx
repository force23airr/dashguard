import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './FlaggedPlates.css';

const FlaggedPlates = () => {
  const [plates, setPlates] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchPlate, setSearchPlate] = useState('');
  const [expandedPlate, setExpandedPlate] = useState(null);

  useEffect(() => {
    fetchFlaggedPlates();
    fetchStats();
  }, [filter]);

  const fetchFlaggedPlates = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?type=${filter}` : '';
      const res = await api.get(`/plates/flagged${params}`);
      setPlates(res.data.plates || []);
    } catch (error) {
      console.error('Error fetching flagged plates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/plates/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getDangerLevel = (score) => {
    if (score >= 100) return { level: 'critical', label: 'CRITICAL', color: '#e53e3e' };
    if (score >= 50) return { level: 'high', label: 'HIGH RISK', color: '#dd6b20' };
    if (score >= 25) return { level: 'medium', label: 'MODERATE', color: '#d69e2e' };
    return { level: 'low', label: 'FLAGGED', color: '#718096' };
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeIcon = (type) => {
    const icons = {
      dangerous_driving: '🚗',
      crime: '🚨',
      traffic_accident: '💥',
      security: '🔒',
      default: '⚠️'
    };
    return icons[type] || icons.default;
  };

  const filteredPlates = searchPlate
    ? plates.filter(p => p.plate.includes(searchPlate.toUpperCase()))
    : plates;

  return (
    <div className="flagged-plates-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1>Dangerous Driver Registry</h1>
          <p>Community-reported vehicles flagged for dangerous driving, crimes, and traffic violations</p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">{stats?.stats?.uniquePlatesCount || 0}</span>
              <span className="stat-label">Flagged Plates</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats?.stats?.incidentsWithPlates || 0}</span>
              <span className="stat-label">Incidents Reported</span>
            </div>
            <div className="stat">
              <span className="stat-value">{plates.filter(p => p.dangerScore >= 50).length}</span>
              <span className="stat-label">High Risk</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Search and Filters */}
        <div className="controls-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search plate number..."
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
              maxLength={10}
            />
            {searchPlate && (
              <button className="clear-btn" onClick={() => setSearchPlate('')}>×</button>
            )}
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Reports
            </button>
            <button
              className={`filter-btn ${filter === 'dangerous_driving' ? 'active' : ''}`}
              onClick={() => setFilter('dangerous_driving')}
            >
              Dangerous Driving
            </button>
            <button
              className={`filter-btn ${filter === 'crime' ? 'active' : ''}`}
              onClick={() => setFilter('crime')}
            >
              Crime
            </button>
            <button
              className={`filter-btn ${filter === 'traffic_accident' ? 'active' : ''}`}
              onClick={() => setFilter('traffic_accident')}
            >
              Accidents
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="leaderboard-section">
          <h2>Most Reported Vehicles</h2>

          {loading ? (
            <div className="loading">Loading flagged plates...</div>
          ) : filteredPlates.length === 0 ? (
            <div className="no-results">
              <p>No flagged plates found.</p>
              <p>Be the first to report a dangerous driver!</p>
              <Link to="/report" className="btn btn-primary">Report Incident</Link>
            </div>
          ) : (
            <div className="plates-list">
              {filteredPlates.map((plate) => {
                const danger = getDangerLevel(plate.dangerScore);
                const isExpanded = expandedPlate === plate.plate;

                return (
                  <div
                    key={plate.plate}
                    className={`plate-card ${danger.level} ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => setExpandedPlate(isExpanded ? null : plate.plate)}
                  >
                    <div className="plate-header">
                      <div className="rank-badge">#{plate.rank}</div>
                      <div className="plate-number">{plate.plate}</div>
                      <div className="danger-badge" style={{ backgroundColor: danger.color }}>
                        {danger.label}
                      </div>
                    </div>

                    <div className="plate-stats">
                      <div className="stat-item">
                        <span className="value">{plate.reportCount}</span>
                        <span className="label">Reports</span>
                      </div>
                      <div className="stat-item">
                        <span className="value">{plate.dangerScore}</span>
                        <span className="label">Danger Score</span>
                      </div>
                      <div className="stat-item">
                        <span className="value">{plate.types?.length || 0}</span>
                        <span className="label">Violation Types</span>
                      </div>
                    </div>

                    <div className="plate-meta">
                      <span>First reported: {formatDate(plate.firstSeen)}</span>
                      <span>Last seen: {formatDate(plate.lastSeen)}</span>
                    </div>

                    {isExpanded && (
                      <div className="plate-details">
                        <h4>Incident Types</h4>
                        <div className="type-tags">
                          {plate.types?.map((type) => (
                            <span key={type} className="type-tag">
                              {getTypeIcon(type)} {type.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>

                        <h4>Recent Incidents</h4>
                        <div className="incidents-list">
                          {plate.recentIncidents?.map((incident, idx) => (
                            <div key={idx} className="incident-item">
                              <span className="incident-type">
                                {getTypeIcon(incident.type)} {incident.type.replace(/_/g, ' ')}
                              </span>
                              <span className={`incident-severity ${incident.severity}`}>
                                {incident.severity}
                              </span>
                              <span className="incident-date">{formatDate(incident.date)}</span>
                              {incident.location && (
                                <span className="incident-location">{incident.location}</span>
                              )}
                            </div>
                          ))}
                        </div>

                        <Link to={`/plates?search=${plate.plate}`} className="btn btn-sm btn-outline">
                          View Full History
                        </Link>
                      </div>
                    )}

                    <div className="expand-indicator">
                      {isExpanded ? '▲ Less' : '▼ Details'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="info-section">
          <div className="info-card">
            <h3>How Danger Scores Work</h3>
            <ul>
              <li><strong>+10 points</strong> per report</li>
              <li><strong>+25 points</strong> for critical severity</li>
              <li><strong>+15 points</strong> for high severity</li>
              <li><strong>+5 points</strong> for medium severity</li>
            </ul>
          </div>
          <div className="info-card">
            <h3>Report a Dangerous Driver</h3>
            <p>
              Help keep roads safe by reporting dangerous driving, accidents, or crimes.
              Your dash cam footage can help identify repeat offenders.
            </p>
            <Link to="/report" className="btn btn-primary">Report Now</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlaggedPlates;
