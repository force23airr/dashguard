import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './InsuranceClaim.css';

function InsuranceClaim() {
  const { claimId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const incidentId = searchParams.get('incidentId');

  const [claim, setClaim] = useState(null);
  const [claims, setClaims] = useState([]);
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('list');

  const [formData, setFormData] = useState({
    claimant: {
      name: { first: '', middle: '', last: '' },
      policyNumber: '',
      insuranceCompany: '',
      contactEmail: '',
      contactPhone: '',
      vehicleInfo: { make: '', model: '', year: '', vin: '', licensePlate: '' }
    },
    lossDetails: {
      dateOfLoss: '',
      timeOfLoss: '',
      descriptionOfLoss: '',
      estimatedDamage: '',
      injuries: false
    },
    thirdParty: {
      involved: false,
      parties: []
    },
    consentToShare: false
  });

  useEffect(() => {
    if (claimId) {
      fetchClaim(claimId);
    } else if (incidentId) {
      fetchIncident(incidentId);
      setActiveTab('new');
    } else {
      fetchClaims();
    }
  }, [claimId, incidentId]);

  const fetchClaims = async () => {
    try {
      const res = await api.get('/insurance/claims');
      setClaims(res.data.claims || []);
    } catch (error) {
      console.error('Failed to load claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClaim = async (id) => {
    try {
      const res = await api.get(`/insurance/claims/${id}`);
      setClaim(res.data);
      setFormData({
        claimant: res.data.claimant || formData.claimant,
        lossDetails: res.data.lossDetails || formData.lossDetails,
        thirdParty: res.data.thirdParty || formData.thirdParty,
        consentToShare: res.data.consentToShare || false
      });
      setActiveTab('view');
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load claim' });
    } finally {
      setLoading(false);
    }
  };

  const fetchIncident = async (id) => {
    try {
      const res = await api.get(`/incidents/${id}`);
      setIncident(res.data);
      setFormData(prev => ({
        ...prev,
        lossDetails: {
          ...prev.lossDetails,
          dateOfLoss: res.data.createdAt?.split('T')[0] || '',
          descriptionOfLoss: res.data.description || ''
        }
      }));
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load incident' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (section, parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parent]: {
          ...prev[section][parent],
          [field]: value
        }
      }
    }));
  };

  const handleCreateClaim = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.post('/insurance/claims', {
        incidentId,
        ...formData
      });
      setMessage({ type: 'success', text: 'Claim created successfully!' });
      navigate(`/insurance/claims/${res.data._id}`);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create claim' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitClaim = async () => {
    setSubmitting(true);
    try {
      await api.post(`/insurance/claims/${claim._id}/submit`, {
        consentToShare: formData.consentToShare
      });
      setMessage({ type: 'success', text: 'Claim submitted for processing!' });
      fetchClaim(claim._id);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit claim' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await api.get(`/insurance/claims/${claim._id}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `claim-${claim.claimId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to download PDF' });
    }
  };

  if (loading) {
    return <div className="container loading">Loading...</div>;
  }

  return (
    <div className="insurance-claim-page">
      <div className="container">
        <h1>Insurance Claims</h1>

        {!claimId && !incidentId && (
          <div className="tabs">
            <button
              className={activeTab === 'list' ? 'active' : ''}
              onClick={() => setActiveTab('list')}
            >
              My Claims
            </button>
            <button
              className={activeTab === 'new' ? 'active' : ''}
              onClick={() => setActiveTab('new')}
            >
              New Claim
            </button>
          </div>
        )}

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        {activeTab === 'list' && (
          <div className="claims-list">
            {claims.length === 0 ? (
              <div className="empty-state">
                <p>No insurance claims yet.</p>
                <p>Create a claim from an incident to get started.</p>
              </div>
            ) : (
              claims.map(c => (
                <div key={c._id} className="claim-card" onClick={() => navigate(`/insurance/claims/${c._id}`)}>
                  <div className="claim-header">
                    <span className="claim-id">{c.claimId}</span>
                    <span className={`status status-${c.status}`}>{c.status.replace('_', ' ')}</span>
                  </div>
                  <div className="claim-details">
                    <p><strong>Incident:</strong> {c.incident?.title || 'N/A'}</p>
                    <p><strong>Policy:</strong> {c.claimant?.policyNumber || 'Not specified'}</p>
                    <p><strong>Created:</strong> {new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'new' && (
          <form onSubmit={handleCreateClaim} className="claim-form">
            {incident && (
              <div className="incident-info">
                <h3>Creating claim for incident:</h3>
                <p><strong>{incident.title}</strong></p>
                <p>{incident.location?.address}</p>
              </div>
            )}

            {!incidentId && (
              <div className="form-group">
                <label>Select an Incident</label>
                <p className="hint">Go to an incident and click "Create Insurance Claim" to start.</p>
              </div>
            )}

            <h3>Claimant Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={formData.claimant.name.first}
                  onChange={(e) => handleNestedChange('claimant', 'name', 'first', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={formData.claimant.name.last}
                  onChange={(e) => handleNestedChange('claimant', 'name', 'last', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Policy Number *</label>
                <input
                  type="text"
                  value={formData.claimant.policyNumber}
                  onChange={(e) => handleInputChange('claimant', 'policyNumber', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Insurance Company</label>
                <input
                  type="text"
                  value={formData.claimant.insuranceCompany}
                  onChange={(e) => handleInputChange('claimant', 'insuranceCompany', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  value={formData.claimant.contactEmail}
                  onChange={(e) => handleInputChange('claimant', 'contactEmail', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  value={formData.claimant.contactPhone}
                  onChange={(e) => handleInputChange('claimant', 'contactPhone', e.target.value)}
                />
              </div>
            </div>

            <h3>Vehicle Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Make</label>
                <input
                  type="text"
                  value={formData.claimant.vehicleInfo.make}
                  onChange={(e) => handleNestedChange('claimant', 'vehicleInfo', 'make', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  value={formData.claimant.vehicleInfo.model}
                  onChange={(e) => handleNestedChange('claimant', 'vehicleInfo', 'model', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input
                  type="number"
                  value={formData.claimant.vehicleInfo.year}
                  onChange={(e) => handleNestedChange('claimant', 'vehicleInfo', 'year', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>VIN</label>
                <input
                  type="text"
                  maxLength="17"
                  value={formData.claimant.vehicleInfo.vin}
                  onChange={(e) => handleNestedChange('claimant', 'vehicleInfo', 'vin', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>License Plate</label>
                <input
                  type="text"
                  value={formData.claimant.vehicleInfo.licensePlate}
                  onChange={(e) => handleNestedChange('claimant', 'vehicleInfo', 'licensePlate', e.target.value)}
                />
              </div>
            </div>

            <h3>Loss Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Date of Loss *</label>
                <input
                  type="date"
                  value={formData.lossDetails.dateOfLoss}
                  onChange={(e) => handleInputChange('lossDetails', 'dateOfLoss', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time of Loss</label>
                <input
                  type="time"
                  value={formData.lossDetails.timeOfLoss}
                  onChange={(e) => handleInputChange('lossDetails', 'timeOfLoss', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description of Loss</label>
              <textarea
                rows="4"
                value={formData.lossDetails.descriptionOfLoss}
                onChange={(e) => handleInputChange('lossDetails', 'descriptionOfLoss', e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Estimated Damage ($)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.lossDetails.estimatedDamage}
                  onChange={(e) => handleInputChange('lossDetails', 'estimatedDamage', e.target.value)}
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.lossDetails.injuries}
                    onChange={(e) => handleInputChange('lossDetails', 'injuries', e.target.checked)}
                  />
                  Were there any injuries?
                </label>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.thirdParty.involved}
                  onChange={(e) => handleInputChange('thirdParty', 'involved', e.target.checked)}
                />
                Third party involved?
              </label>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting || !incidentId}>
              {submitting ? 'Creating...' : 'Create Claim Draft'}
            </button>
          </form>
        )}

        {activeTab === 'view' && claim && (
          <div className="claim-view">
            <div className="claim-header-view">
              <div>
                <h2>Claim #{claim.claimId}</h2>
                <span className={`status status-${claim.status}`}>{claim.status.replace('_', ' ')}</span>
              </div>
              <div className="claim-actions">
                <button onClick={handleDownloadPDF} className="btn-secondary">
                  Download PDF
                </button>
                {claim.status === 'draft' && (
                  <button onClick={handleSubmitClaim} className="btn-primary" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Claim'}
                  </button>
                )}
              </div>
            </div>

            <div className="claim-section">
              <h3>Claimant</h3>
              <p><strong>Name:</strong> {[claim.claimant?.name?.first, claim.claimant?.name?.last].filter(Boolean).join(' ') || 'N/A'}</p>
              <p><strong>Policy:</strong> {claim.claimant?.policyNumber || 'N/A'}</p>
              <p><strong>Insurance:</strong> {claim.claimant?.insuranceCompany || 'N/A'}</p>
            </div>

            <div className="claim-section">
              <h3>Vehicle</h3>
              <p>
                {claim.claimant?.vehicleInfo?.year} {claim.claimant?.vehicleInfo?.make} {claim.claimant?.vehicleInfo?.model}
              </p>
              <p><strong>VIN:</strong> {claim.claimant?.vehicleInfo?.vin || 'N/A'}</p>
              <p><strong>Plate:</strong> {claim.claimant?.vehicleInfo?.licensePlate || 'N/A'}</p>
            </div>

            <div className="claim-section">
              <h3>Loss Details</h3>
              <p><strong>Date:</strong> {claim.lossDetails?.dateOfLoss ? new Date(claim.lossDetails.dateOfLoss).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Estimated Damage:</strong> ${claim.lossDetails?.estimatedDamage?.toLocaleString() || 'N/A'}</p>
              <p><strong>Description:</strong> {claim.lossDetails?.descriptionOfLoss || 'N/A'}</p>
            </div>

            {claim.statusHistory?.length > 0 && (
              <div className="claim-section">
                <h3>Status History</h3>
                <div className="status-history">
                  {claim.statusHistory.map((entry, index) => (
                    <div key={index} className="history-entry">
                      <span className={`status status-${entry.status}`}>{entry.status.replace('_', ' ')}</span>
                      <span className="date">{new Date(entry.changedAt).toLocaleString()}</span>
                      {entry.notes && <span className="notes">{entry.notes}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className="back-btn" onClick={() => navigate('/insurance/claims')}>
              ← Back to Claims
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default InsuranceClaim;
