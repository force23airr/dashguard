import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './IncidentDetail.css';

const IncidentDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const fetchIncident = async () => {
    try {
      const res = await api.get(`/incidents/${id}`);
      setIncident(res.data);
    } catch (error) {
      console.error('Error fetching incident:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this incident?')) return;

    try {
      await api.delete(`/incidents/${id}`);
      navigate('/incidents');
    } catch (error) {
      console.error('Error deleting incident:', error);
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!alertMessage.trim()) return;

    setCreating(true);
    try {
      await api.post('/alerts', {
        incidentId: id,
        message: alertMessage
      });
      setAlertMessage('');
      alert('Alert created and broadcasted!');
    } catch (error) {
      console.error('Error creating alert:', error);
    } finally {
      setCreating(false);
    }
  };

  const typeLabels = {
    dangerous_driving: 'Dangerous Driving',
    crime: 'Crime',
    security: 'Security',
    other: 'Other'
  };

  if (loading) {
    return <div className="container text-center mt-3">Loading...</div>;
  }

  if (!incident) {
    return (
      <div className="container text-center mt-3">
        <p>Incident not found</p>
        <Link to="/incidents" className="btn btn-primary">
          Back to Incidents
        </Link>
      </div>
    );
  }

  const isOwner = user?._id === incident.user?._id;

  return (
    <div className="incident-detail">
      <div className="container">
        <Link to="/incidents" className="back-link">
          &larr; Back to Incidents
        </Link>

        <div className="incident-detail-grid">
          <div className="incident-main">
            {incident.mediaFiles?.length > 0 && (
              <div className="incident-media-gallery">
                {incident.mediaFiles.map((file, index) => (
                  <div key={index} className="media-item">
                    {file.mimetype.startsWith('video') ? (
                      <video src={file.path} controls />
                    ) : (
                      <img src={file.path} alt={`Media ${index + 1}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="incident-badges">
              <span className={`badge type-${incident.type}`}>
                {typeLabels[incident.type]}
              </span>
              <span className={`badge severity-${incident.severity}`}>
                {incident.severity}
              </span>
              <span className={`badge badge-${incident.status === 'resolved' ? 'success' : 'secondary'}`}>
                {incident.status}
              </span>
            </div>

            <h1>{incident.title}</h1>

            <div className="incident-meta">
              <span>Reported by <strong>{incident.user?.username}</strong></span>
              <span>{new Date(incident.createdAt).toLocaleString()}</span>
            </div>

            <div className="incident-location">
              <strong>Location:</strong> {incident.location?.address}
            </div>

            <div className="incident-description">
              <h3>Description</h3>
              <p>{incident.description}</p>
            </div>

            {isOwner && (
              <div className="incident-actions">
                <button onClick={handleDelete} className="btn btn-danger">
                  Delete Incident
                </button>
              </div>
            )}
          </div>

          <div className="incident-sidebar">
            {isAuthenticated && (
              <>
                <div className="card create-alert-card">
                  <h3>Create Alert</h3>
                  <p>Warn the community about this incident</p>
                  <form onSubmit={handleCreateAlert}>
                    <div className="form-group">
                      <textarea
                        placeholder="Enter alert message..."
                        value={alertMessage}
                        onChange={(e) => setAlertMessage(e.target.value)}
                        rows={3}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-warning"
                      disabled={creating}
                      style={{ width: '100%' }}
                    >
                      {creating ? 'Creating...' : 'Broadcast Alert'}
                    </button>
                  </form>
                </div>

                {isOwner && (
                  <div className="card actions-card">
                    <h3>Actions</h3>
                    <div className="action-buttons">
                      <Link
                        to={`/incidents/${id}/police-report`}
                        className="btn btn-action"
                      >
                        Generate Police Report
                      </Link>
                      <Link
                        to={`/insurance/claims?incidentId=${id}`}
                        className="btn btn-action"
                      >
                        Create Insurance Claim
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetail;
