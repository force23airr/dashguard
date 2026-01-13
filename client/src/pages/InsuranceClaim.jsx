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
  const [insurancePartners, setInsurancePartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('list');

  // Involvement flow state
  const [involvementType, setInvolvementType] = useState(null); // 'involved' | 'witness'
  const [selectedInsurer, setSelectedInsurer] = useState(null);
  const [insurerSearch, setInsurerSearch] = useState('');

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
    fetchInsurancePartners();
    if (claimId) {
      fetchClaim(claimId);
    } else if (incidentId) {
      fetchIncident(incidentId);
      setActiveTab('new');
    } else {
      fetchClaims();
    }
  }, [claimId, incidentId]);

  const fetchInsurancePartners = async () => {
    try {
      const res = await api.get('/partners/insurance');
      setInsurancePartners(res.data.partners || []);
    } catch (error) {
      console.error('Failed to load insurance partners:', error);
    }
  };

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

  const handleSelectInsurer = (insurer) => {
    setSelectedInsurer(insurer);
    setFormData(prev => ({
      ...prev,
      claimant: {
        ...prev.claimant,
        insuranceCompany: insurer.name
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
        involvementType,
        insurancePartnerId: selectedInsurer?._id,
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

  const handleWitnessReport = async () => {
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/insurance/witness-report', {
        incidentId,
        description: formData.lossDetails.descriptionOfLoss
      });
      setMessage({ type: 'success', text: 'Witness report submitted! You earned 15 credits.' });
      setTimeout(() => navigate('/incidents'), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit report' });
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

  const filteredInsurers = insurancePartners.filter(p =>
    p.name.toLowerCase().includes(insurerSearch.toLowerCase())
  );

  if (loading) {
    return <div className="container loading">Loading...</div>;
  }

  // Involvement Selection Screen
  const renderInvolvementSelection = () => (
    <div className="involvement-selection">
      <h2>What's your involvement?</h2>
      <p className="involvement-subtitle">Choose how you were connected to this incident</p>

      <div className="involvement-options">
        <div
          className={`involvement-card ${involvementType === 'involved' ? 'selected' : ''}`}
          onClick={() => setInvolvementType('involved')}
        >
          <span className="involvement-icon">&#128663;</span>
          <h3>I Was Involved</h3>
          <p>I was a driver or passenger in this incident and want to file a claim with my insurance company.</p>
          <ul className="involvement-details">
            <li>File a claim with YOUR insurance</li>
            <li>Send video evidence directly</li>
            <li>Track claim status</li>
          </ul>
        </div>

        <div
          className={`involvement-card ${involvementType === 'witness' ? 'selected' : ''}`}
          onClick={() => setInvolvementType('witness')}
        >
          <span className="involvement-icon">&#128065;</span>
          <h3>I Witnessed This</h3>
          <p>I captured footage of an incident I was not involved in and want to help others.</p>
          <ul className="involvement-details">
            <li>Help insurance companies investigate</li>
            <li>Flag dangerous drivers</li>
            <li>Earn 15 credits for your report</li>
          </ul>
        </div>
      </div>

      {involvementType && (
        <button className="continue-btn" onClick={() => {}}>
          Continue
        </button>
      )}
    </div>
  );

  // Insurance Company Selector
  const renderInsurerSelector = () => (
    <div className="insurer-selector">
      <button className="back-link" onClick={() => setInvolvementType(null)}>
        ← Back to involvement selection
      </button>

      <h2>Select Your Insurance Company</h2>
      <p className="selector-subtitle">We'll help you send your claim directly to them</p>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search insurance companies..."
          value={insurerSearch}
          onChange={(e) => setInsurerSearch(e.target.value)}
        />
      </div>

      <div className="featured-insurers">
        <h4>Popular Insurance Companies</h4>
        <div className="insurer-grid">
          {insurancePartners.filter(p => p.isFeatured).slice(0, 6).map(insurer => (
            <div
              key={insurer._id}
              className={`insurer-card ${selectedInsurer?._id === insurer._id ? 'selected' : ''}`}
              onClick={() => handleSelectInsurer(insurer)}
            >
              <span className="insurer-logo">&#128736;</span>
              <span className="insurer-name">{insurer.name}</span>
              {insurer.features?.acceptsVideoClaims && (
                <span className="video-badge">Accepts Video</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="all-insurers">
        <h4>All Insurance Companies</h4>
        <div className="insurer-list">
          {filteredInsurers.map(insurer => (
            <div
              key={insurer._id}
              className={`insurer-list-item ${selectedInsurer?._id === insurer._id ? 'selected' : ''}`}
              onClick={() => handleSelectInsurer(insurer)}
            >
              <span className="insurer-name">{insurer.name}</span>
              <div className="insurer-features">
                {insurer.features?.acceptsVideoClaims && <span className="feature-tag">Video</span>}
                {insurer.features?.hasApiIntegration && <span className="feature-tag">Direct Submit</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="custom-insurer-note">
        Don't see your insurance company? You can still create a claim and we'll provide a PDF for manual submission.
      </p>
    </div>
  );

  // Witness Report Form
  const renderWitnessForm = () => (
    <div className="witness-form">
      <button className="back-link" onClick={() => setInvolvementType(null)}>
        ← Back to involvement selection
      </button>

      <div className="witness-header">
        <span className="witness-icon">&#128065;</span>
        <div>
          <h2>Community Witness Report</h2>
          <p>Help others by sharing what you saw</p>
        </div>
      </div>

      {incident && (
        <div className="incident-info">
          <h4>Incident Details</h4>
          <p><strong>{incident.title}</strong></p>
          <p>{incident.location?.address}</p>
          <p>Date: {new Date(incident.createdAt).toLocaleDateString()}</p>
        </div>
      )}

      <div className="witness-benefits">
        <h4>Your report helps:</h4>
        <ul>
          <li>&#10003; Insurance companies investigate claims accurately</li>
          <li>&#10003; Flag dangerous drivers in the community database</li>
          <li>&#10003; Improve road safety for everyone</li>
        </ul>
      </div>

      <div className="form-group">
        <label>Additional Details (Optional)</label>
        <textarea
          rows="4"
          placeholder="Describe what you witnessed..."
          value={formData.lossDetails.descriptionOfLoss}
          onChange={(e) => handleInputChange('lossDetails', 'descriptionOfLoss', e.target.value)}
        />
      </div>

      <div className="reward-box">
        <span className="reward-icon">&#127942;</span>
        <div>
          <strong>You'll earn: 15 credits</strong>
          <p>Thank you for helping the community!</p>
        </div>
      </div>

      <button
        className="submit-btn witness-submit"
        onClick={handleWitnessReport}
        disabled={submitting}
      >
        {submitting ? 'Submitting...' : 'Submit Witness Report'}
      </button>
    </div>
  );

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
                    <p><strong>Insurance:</strong> {c.claimant?.insuranceCompany || 'N/A'}</p>
                    <p><strong>Created:</strong> {new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'new' && incidentId && !involvementType && renderInvolvementSelection()}

        {activeTab === 'new' && involvementType === 'involved' && !selectedInsurer && renderInsurerSelector()}

        {activeTab === 'new' && involvementType === 'witness' && renderWitnessForm()}

        {activeTab === 'new' && involvementType === 'involved' && selectedInsurer && (
          <form onSubmit={handleCreateClaim} className="claim-form">
            <button type="button" className="back-link" onClick={() => setSelectedInsurer(null)}>
              ← Back to insurance selection
            </button>

            {incident && (
              <div className="incident-info">
                <h3>Creating claim for incident:</h3>
                <p><strong>{incident.title}</strong></p>
                <p>{incident.location?.address}</p>
              </div>
            )}

            <div className="selected-insurer-display">
              <span className="insurer-logo">&#128736;</span>
              <div>
                <strong>{selectedInsurer.name}</strong>
                <p>Your claim will be sent to this insurance company</p>
              </div>
            </div>

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
                  disabled
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

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Claim Draft'}
            </button>
          </form>
        )}

        {activeTab === 'new' && !incidentId && (
          <div className="no-incident-message">
            <div className="form-group">
              <label>Select an Incident</label>
              <p className="hint">Go to an incident and click "Create Insurance Claim" to start.</p>
              <button
                className="btn-secondary"
                onClick={() => navigate('/incidents')}
              >
                Browse Incidents
              </button>
            </div>
          </div>
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
