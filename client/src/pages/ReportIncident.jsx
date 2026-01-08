import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ReportIncident.css';

const ReportIncident = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'dangerous_driving',
    severity: 'medium',
    address: ''
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    // Create previews
    const newPreviews = selectedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type
    }));
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('type', formData.type);
      data.append('severity', formData.severity);
      data.append('location', JSON.stringify({ address: formData.address }));

      files.forEach((file) => {
        data.append('media', file);
      });

      const res = await api.post('/incidents', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate(`/incidents/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-page">
      <div className="container">
        <div className="report-card">
          <h1>Report an Incident</h1>
          <p className="report-subtitle">
            Share dash cam footage and details about what you witnessed
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Brief title for the incident"
                maxLength={100}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Incident Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="dangerous_driving">Dangerous Driving</option>
                  <option value="crime">Crime</option>
                  <option value="security">Security Concern</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="severity">Severity</label>
                <select
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Location</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Street address or intersection"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe what happened in detail..."
                rows={5}
                maxLength={1000}
              />
            </div>

            <div className="form-group">
              <label htmlFor="media">Upload Media</label>
              <div className="file-upload">
                <input
                  type="file"
                  id="media"
                  onChange={handleFileChange}
                  multiple
                  accept="image/*,video/*"
                />
                <div className="file-upload-label">
                  <span>&#128247;</span>
                  <p>Click to upload videos or images</p>
                  <small>Max 5 files, 100MB each</small>
                </div>
              </div>

              {previews.length > 0 && (
                <div className="file-previews">
                  {previews.map((preview, index) => (
                    <div key={index} className="preview-item">
                      {preview.type.startsWith('video') ? (
                        <video src={preview.url} />
                      ) : (
                        <img src={preview.url} alt={`Preview ${index + 1}`} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportIncident;
