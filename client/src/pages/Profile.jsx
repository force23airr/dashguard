import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import IncidentCard from '../components/IncidentCard';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    resolved: 0
  });

  useEffect(() => {
    fetchUserIncidents();
  }, [user]);

  const fetchUserIncidents = async () => {
    try {
      const res = await api.get(`/incidents/user/${user._id}`);
      setIncidents(res.data);

      // Calculate stats
      const newStats = {
        total: res.data.length,
        pending: res.data.filter((i) => i.status === 'pending').length,
        verified: res.data.filter((i) => i.status === 'verified').length,
        resolved: res.data.filter((i) => i.status === 'resolved').length
      };
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching user incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1>{user?.username}</h1>
            <p>{user?.email}</p>
            <span className="member-since">Member since {formatDate(user?.createdAt)}</span>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Reports</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.verified}</span>
            <span className="stat-label">Verified</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.resolved}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>

        <div className="profile-incidents">
          <h2>Your Reports</h2>

          {loading ? (
            <div className="text-center">Loading...</div>
          ) : incidents.length === 0 ? (
            <div className="empty-state">
              <p>You haven't reported any incidents yet</p>
            </div>
          ) : (
            <div className="incidents-grid">
              {incidents.map((incident) => (
                <IncidentCard key={incident._id} incident={incident} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
