import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './MyViolationReports.css';

const VIOLATION_TYPE_LABELS = {
  running_red_light: 'Running Red Light',
  running_stop_sign: 'Running Stop Sign',
  speeding: 'Speeding',
  illegal_lane_change: 'Illegal Lane Change',
  unsafe_lane_change: 'Unsafe Lane Change',
  failure_to_signal: 'Failure to Signal',
  tailgating: 'Tailgating',
  following_too_close: 'Following Too Close',
  reckless_driving: 'Reckless Driving',
  aggressive_driving: 'Aggressive Driving',
  road_rage: 'Road Rage',
  hit_and_run: 'Hit and Run',
  dui_suspected: 'Suspected DUI',
  distracted_driving: 'Distracted Driving',
  texting_while_driving: 'Texting While Driving',
  illegal_turn: 'Illegal Turn',
  illegal_u_turn: 'Illegal U-Turn',
  failure_to_yield: 'Failure to Yield',
  wrong_way_driving: 'Wrong Way Driving',
  street_racing: 'Street Racing',
  exhibition_of_speed: 'Exhibition of Speed',
  failure_to_stop_for_school_bus: 'Failure to Stop for School Bus',
  passing_on_right: 'Passing on Right',
  crossing_double_yellow: 'Crossing Double Yellow',
  other: 'Other Violation'
};

function MyViolationReports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [violations, setViolations] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchViolations();
  }, [user, filter]);

  const fetchViolations = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filter !== 'all') {
        params.status = filter;
      }
      const response = await api.get('/violations/my-reports', { params });
      setViolations(response.data.violations);
      setStats(response.data.stats);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching violations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      await api.delete(`/violations/${id}`);
      fetchViolations(pagination.current);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete report');
    }
  };

  if (!user) return null;

  return (
    <div className="my-violations">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <h1>My Violation Reports</h1>
            <p>Track and manage your submitted traffic violation reports</p>
          </div>
          <Link to="/report-violation" className="btn-new-report">
            + Report New Violation
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">{stats.total || 0}</span>
            <span className="stat-label">Total Reports</span>
          </div>
          <div className="stat-card stat-submitted">
            <span className="stat-number">{stats.submitted || 0}</span>
            <span className="stat-label">Submitted</span>
          </div>
          <div className="stat-card stat-verified">
            <span className="stat-number">{stats.verified || 0}</span>
            <span className="stat-label">Verified</span>
          </div>
          <div className="stat-card stat-authorities">
            <span className="stat-number">{stats.submittedToAuthorities || 0}</span>
            <span className="stat-label">With Authorities</span>
          </div>
          <div className="stat-card stat-citations">
            <span className="stat-number">{stats.citationsIssued || 0}</span>
            <span className="stat-label">Citations Issued</span>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'submitted' ? 'active' : ''}`}
            onClick={() => setFilter('submitted')}
          >
            Submitted
          </button>
          <button
            className={`filter-btn ${filter === 'verified' ? 'active' : ''}`}
            onClick={() => setFilter('verified')}
          >
            Verified
          </button>
          <button
            className={`filter-btn ${filter === 'submitted_to_authorities' ? 'active' : ''}`}
            onClick={() => setFilter('submitted_to_authorities')}
          >
            With Authorities
          </button>
          <button
            className={`filter-btn ${filter === 'closed' ? 'active' : ''}`}
            onClick={() => setFilter('closed')}
          >
            Closed
          </button>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="loading">Loading your reports...</div>
        ) : violations.length === 0 ? (
          <div className="empty-state">
            <h3>No Reports Found</h3>
            <p>
              {filter === 'all'
                ? "You haven't submitted any violation reports yet."
                : `No reports with status "${filter.replace(/_/g, ' ')}".`}
            </p>
            <Link to="/report-violation" className="btn-primary">
              Report a Violation
            </Link>
          </div>
        ) : (
          <div className="reports-list">
            {violations.map((violation) => (
              <div key={violation._id} className="report-card">
                <div className="report-main">
                  <div className="report-header">
                    <span className="report-number">{violation.reportNumber}</span>
                    <span className={`status-badge status-${violation.status}`}>
                      {violation.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="report-title">
                    {VIOLATION_TYPE_LABELS[violation.violationType] || violation.violationType}
                  </h3>

                  <div className="report-details">
                    <div className="detail-item">
                      <span className="detail-label">Plate</span>
                      <span className="detail-value license-plate">
                        {violation.offendingVehicle?.licensePlate}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Location</span>
                      <span className="detail-value">{violation.location?.address}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Date</span>
                      <span className="detail-value">
                        {new Date(violation.incidentDateTime).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Severity</span>
                      <span className={`severity-badge severity-${violation.severity}`}>
                        {violation.severity}
                      </span>
                    </div>
                  </div>

                  {/* Submission Tracking */}
                  {(violation.lawEnforcementSubmissions?.length > 0 ||
                    violation.insuranceSubmissions?.length > 0) && (
                    <div className="submission-tracking">
                      {violation.lawEnforcementSubmissions?.map((sub, i) => (
                        <div key={i} className="tracking-item police">
                          <span className="tracking-icon">&#x1F46E;</span>
                          <span className="tracking-text">
                            Police: {sub.status}
                            {sub.citationNumber && ` - Citation #${sub.citationNumber}`}
                          </span>
                        </div>
                      ))}
                      {violation.insuranceSubmissions?.map((sub, i) => (
                        <div key={i} className="tracking-item insurance">
                          <span className="tracking-icon">&#x1F4CB;</span>
                          <span className="tracking-text">
                            Insurance: {sub.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Community Votes */}
                  <div className="community-votes">
                    <span className="vote-confirms">
                      &#x2714; {violation.verification?.communityVotes?.confirms || 0}
                    </span>
                    <span className="vote-disputes">
                      &#x2718; {violation.verification?.communityVotes?.disputes || 0}
                    </span>
                    <span className={`verification-status status-${violation.verification?.status}`}>
                      {violation.verification?.status}
                    </span>
                  </div>
                </div>

                <div className="report-actions">
                  <Link to={`/violations/${violation._id}`} className="btn-view">
                    View Details
                  </Link>
                  {['draft', 'submitted'].includes(violation.status) && (
                    <>
                      <Link to={`/violations/${violation._id}/edit`} className="btn-edit">
                        Edit
                      </Link>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(violation._id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              disabled={pagination.current <= 1}
              onClick={() => fetchViolations(pagination.current - 1)}
            >
              Previous
            </button>
            <span className="page-info">
              Page {pagination.current} of {pagination.pages}
            </span>
            <button
              disabled={pagination.current >= pagination.pages}
              onClick={() => fetchViolations(pagination.current + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyViolationReports;
