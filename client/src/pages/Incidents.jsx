import { useState, useEffect } from 'react';
import api from '../services/api';
import IncidentCard from '../components/IncidentCard';
import './Incidents.css';

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    status: ''
  });

  useEffect(() => {
    fetchIncidents();
  }, [filters, pagination.current]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current,
        limit: 12
      });

      if (filters.type) params.append('type', filters.type);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.status) params.append('status', filters.status);

      const res = await api.get(`/incidents?${params}`);
      setIncidents(res.data.incidents);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPagination({ ...pagination, current: 1 });
  };

  return (
    <div className="incidents-page">
      <div className="container">
        <h1>Reported Incidents</h1>

        <div className="incidents-filters">
          <div className="filter-group">
            <label>Type</label>
            <select name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="dangerous_driving">Dangerous Driving</option>
              <option value="crime">Crime</option>
              <option value="security">Security</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Severity</label>
            <select name="severity" value={filters.severity} onChange={handleFilterChange}>
              <option value="">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center mt-3">Loading...</div>
        ) : incidents.length === 0 ? (
          <div className="empty-state">
            <p>No incidents found matching your filters</p>
          </div>
        ) : (
          <>
            <div className="incidents-grid">
              {incidents.map((incident) => (
                <IncidentCard key={incident._id} incident={incident} />
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-outline"
                  disabled={pagination.current === 1}
                  onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
                >
                  Previous
                </button>
                <span>
                  Page {pagination.current} of {pagination.pages}
                </span>
                <button
                  className="btn btn-outline"
                  disabled={pagination.current === pagination.pages}
                  onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Incidents;
