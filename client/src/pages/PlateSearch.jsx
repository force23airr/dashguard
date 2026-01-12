import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './PlateSearch.css';

const PlateSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setError('Please enter at least 3 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/plates/search?plate=${encodeURIComponent(searchQuery.trim())}`);
      setResults(res.data);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const typeLabels = {
    dangerous_driving: 'Dangerous Driving',
    crime: 'Crime',
    security: 'Security',
    other: 'Other'
  };

  return (
    <div className="plate-search-page">
      <div className="container">
        <div className="search-header">
          <h1>License Plate Search</h1>
          <p>Search for vehicles involved in reported incidents</p>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Enter license plate (e.g., ABC1234)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              maxLength={10}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && <p className="search-error">{error}</p>}
        </form>

        {results && (
          <div className="search-results">
            <div className="results-header">
              <h2>Results for "{searchQuery}"</h2>
              <span className="results-count">{results.count} incident(s) found</span>
            </div>

            {results.count === 0 ? (
              <div className="no-results">
                <p>No incidents found matching this plate number.</p>
                <p className="hint">This could mean the vehicle hasn't been reported or the plate was entered differently.</p>
              </div>
            ) : (
              <>
                {results.count >= 3 && (
                  <div className="repeat-offender-alert">
                    <strong>REPEAT OFFENDER DETECTED</strong>
                    <p>This license plate has been involved in {results.count} incidents.</p>
                  </div>
                )}

                <div className="results-list">
                  {results.incidents.map((incident) => (
                    <div key={incident._id} className="result-card">
                      <div className="result-header">
                        <Link to={`/incidents/${incident._id}`} className="result-title">
                          {incident.title}
                        </Link>
                        <span className={`badge type-${incident.type}`}>
                          {typeLabels[incident.type]}
                        </span>
                      </div>

                      <div className="result-meta">
                        <span className={`severity-${incident.severity}`}>
                          {incident.severity} severity
                        </span>
                        <span>{new Date(incident.createdAt).toLocaleDateString()}</span>
                        <span>{incident.location}</span>
                        <span>Reported by {incident.reporter}</span>
                      </div>

                      <div className="matching-plates">
                        <strong>Matching plates:</strong>
                        {incident.matchingPlates.map((plate, idx) => (
                          <span key={idx} className="plate-tag">
                            {plate.plate}
                            {plate.confidence && ` (${plate.confidence}%)`}
                            {plate.isVerified && <span className="verified">verified</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="search-info">
          <h3>About Plate Search</h3>
          <ul>
            <li>Search is case-insensitive and ignores spaces/dashes</li>
            <li>Partial matches are supported (minimum 3 characters)</li>
            <li>Plates with 3+ incidents are flagged as repeat offenders</li>
            <li>Only verified plates are used for official reports</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlateSearch;
