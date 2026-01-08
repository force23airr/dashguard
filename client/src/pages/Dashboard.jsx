import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import socket, { connectSocket, disconnectSocket } from '../services/socket';
import AlertCard from '../components/AlertCard';
import IncidentCard from '../components/IncidentCard';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    connectSocket();

    // Listen for new alerts
    socket.on('new-alert', (alert) => {
      setAlerts((prev) => [alert, ...prev]);
    });

    // Listen for deleted alerts
    socket.on('delete-alert', (alertId) => {
      setAlerts((prev) => prev.filter((a) => a._id !== alertId));
    });

    return () => {
      socket.off('new-alert');
      socket.off('delete-alert');
      disconnectSocket();
    };
  }, []);

  const fetchData = async () => {
    try {
      const [alertsRes, incidentsRes] = await Promise.all([
        api.get('/alerts'),
        api.get('/incidents?limit=6')
      ]);
      setAlerts(alertsRes.data);
      setIncidents(incidentsRes.data.incidents);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await api.delete(`/alerts/${alertId}`);
      // Socket will handle removal
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  if (loading) {
    return <div className="container text-center mt-3">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.username}</h1>
          <Link to="/report" className="btn btn-primary">
            Report Incident
          </Link>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-alerts">
            <div className="section-header">
              <h2>Active Alerts</h2>
              <span className="badge badge-warning">{alerts.length} active</span>
            </div>

            {alerts.length === 0 ? (
              <div className="empty-state">
                <p>No active alerts in your area</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <AlertCard
                  key={alert._id}
                  alert={alert}
                  onDelete={handleDeleteAlert}
                  canDelete={alert.user?._id === user?._id}
                />
              ))
            )}
          </div>

          <div className="dashboard-incidents">
            <div className="section-header">
              <h2>Recent Incidents</h2>
              <Link to="/incidents" className="view-all">
                View All
              </Link>
            </div>

            {incidents.length === 0 ? (
              <div className="empty-state">
                <p>No incidents reported yet</p>
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
    </div>
  );
};

export default Dashboard;
