import { Link } from 'react-router-dom';
import './AlertCard.css';

const AlertCard = ({ alert, onDelete, canDelete }) => {
  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="alert-card">
      <div className="alert-header">
        <span className={`badge type-${alert.incident?.type}`}>
          {alert.incident?.type?.replace('_', ' ')}
        </span>
        <span className={`badge severity-${alert.incident?.severity}`}>
          {alert.incident?.severity}
        </span>
        <span className="alert-time">{formatTime(alert.createdAt)}</span>
      </div>

      <p className="alert-message">{alert.message}</p>

      {alert.incident && (
        <Link to={`/incidents/${alert.incident._id}`} className="alert-incident">
          <strong>{alert.incident.title}</strong>
          <span className="alert-location">{alert.incident.location?.address}</span>
        </Link>
      )}

      <div className="alert-footer">
        <span className="alert-user">by {alert.user?.username}</span>
        {canDelete && (
          <button
            onClick={() => onDelete(alert._id)}
            className="btn btn-outline"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertCard;
