import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './PoliceReport.css';

function PoliceReport() {
  const { incidentId } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('');
  const [method, setMethod] = useState('download');
  const [anonymize, setAnonymize] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState([]);
  const [searchCity, setSearchCity] = useState('');
  const [searchState, setSearchState] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchIncident();
    fetchStations();
    fetchReports();
  }, [incidentId]);

  const fetchIncident = async () => {
    try {
      const res = await api.get(`/incidents/${incidentId}`);
      setIncident(res.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load incident' });
    }
  };

  const fetchStations = async () => {
    try {
      const params = new URLSearchParams();
      if (searchCity) params.append('city', searchCity);
      if (searchState) params.append('state', searchState);

      const res = await api.get(`/police/stations?${params.toString()}`);
      setStations(res.data.stations || []);
    } catch (error) {
      console.error('Failed to load stations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await api.get(`/police/incidents/${incidentId}/reports`);
      setReports(res.data || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStations();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.post(`/police/incidents/${incidentId}/report`, {
        policeStationId: selectedStation || null,
        method,
        anonymize
      });

      setMessage({ type: 'success', text: res.data.message });

      // If download method, trigger PDF download
      if (method === 'download' && res.data.report?.pdfPath) {
        window.open(res.data.report.pdfPath, '_blank');
      }

      fetchReports();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to generate report' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container loading">Loading...</div>;
  }

  return (
    <div className="police-report-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <h1>Generate Police Report</h1>

        {incident && (
          <div className="incident-summary">
            <h3>{incident.title}</h3>
            <div className="badges">
              <span className={`badge type-${incident.type}`}>{incident.type.replace('_', ' ')}</span>
              <span className={`badge severity-${incident.severity}`}>{incident.severity}</span>
            </div>
            <p className="location">{incident.location?.address}</p>
          </div>
        )}

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-section">
            <h3>Delivery Method</h3>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="download"
                  checked={method === 'download'}
                  onChange={(e) => setMethod(e.target.value)}
                />
                Download PDF
              </label>
              <label>
                <input
                  type="radio"
                  value="email"
                  checked={method === 'email'}
                  onChange={(e) => setMethod(e.target.value)}
                />
                Send via Email
              </label>
            </div>
          </div>

          {method === 'email' && (
            <div className="form-section">
              <h3>Select Police Station</h3>

              <div className="station-search">
                <input
                  type="text"
                  placeholder="City"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="State"
                  value={searchState}
                  onChange={(e) => setSearchState(e.target.value)}
                />
                <button type="button" onClick={handleSearch}>Search</button>
              </div>

              <div className="stations-list">
                {stations.length === 0 ? (
                  <p className="no-stations">No police stations found. Try a different search.</p>
                ) : (
                  stations.map(station => (
                    <label key={station._id} className={`station-option ${selectedStation === station._id ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="station"
                        value={station._id}
                        checked={selectedStation === station._id}
                        onChange={(e) => setSelectedStation(e.target.value)}
                      />
                      <div className="station-info">
                        <strong>{station.name}</strong>
                        <span>{station.jurisdiction}</span>
                        <span className="email">{station.email}</span>
                        <span className="address">
                          {station.address?.city}, {station.address?.state}
                        </span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="form-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={anonymize}
                onChange={(e) => setAnonymize(e.target.checked)}
              />
              Anonymize my personal information in the report
            </label>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={submitting || (method === 'email' && !selectedStation)}
          >
            {submitting ? 'Generating...' : method === 'email' ? 'Generate & Send Report' : 'Generate Report'}
          </button>
        </form>

        {reports.length > 0 && (
          <div className="previous-reports">
            <h3>Previous Reports</h3>
            <div className="reports-list">
              {reports.map((report, index) => (
                <div key={index} className="report-item">
                  <div className="report-info">
                    <span className="report-id">{report.reportId}</span>
                    <span className={`status status-${report.status}`}>{report.status}</span>
                  </div>
                  <div className="report-meta">
                    <span>Method: {report.method}</span>
                    <span>Sent: {new Date(report.sentAt).toLocaleString()}</span>
                  </div>
                  {report.pdfPath && (
                    <a href={report.pdfPath} target="_blank" rel="noopener noreferrer" className="download-link">
                      Download PDF
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PoliceReport;
