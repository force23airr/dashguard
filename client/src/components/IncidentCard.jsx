import { Link } from 'react-router-dom';
import './IncidentCard.css';

const IncidentCard = ({ incident }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const typeLabels = {
    dangerous_driving: 'Dangerous Driving',
    crime: 'Crime',
    security: 'Security',
    other: 'Other'
  };

  return (
    <Link to={`/incidents/${incident._id}`} className="incident-card">
      {incident.mediaFiles?.length > 0 && (
        <div className="incident-media">
          {incident.mediaFiles[0].mimetype.startsWith('video') ? (
            <video src={incident.mediaFiles[0].path} />
          ) : (
            <img src={incident.mediaFiles[0].path} alt={incident.title} />
          )}
        </div>
      )}

      <div className="incident-content">
        <div className="incident-badges">
          <span className={`badge type-${incident.type}`}>
            {typeLabels[incident.type]}
          </span>
          <span className={`badge severity-${incident.severity}`}>
            {incident.severity}
          </span>
        </div>

        <h3 className="incident-title">{incident.title}</h3>

        <p className="incident-description">
          {incident.description.length > 100
            ? incident.description.substring(0, 100) + '...'
            : incident.description}
        </p>

        <div className="incident-meta">
          <span className="incident-location">{incident.location?.address}</span>
          <span className="incident-date">{formatDate(incident.createdAt)}</span>
        </div>

        <div className="incident-user">
          Reported by <strong>{incident.user?.username}</strong>
        </div>
      </div>
    </Link>
  );
};

export default IncidentCard;
