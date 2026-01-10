import { useState, useEffect } from 'react';
import api from '../services/api';
import './Marketplace.css';

function Marketplace() {
  const [consent, setConsent] = useState(null);
  const [contributions, setContributions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState({ type: '', text: '' });

  const [preferences, setPreferences] = useState({
    allowVideoUsage: true,
    allowImageUsage: true,
    anonymizeFaces: true,
    anonymizePlates: true,
    removeAudio: true,
    allowLocationData: false,
    allowTimeData: true
  });

  useEffect(() => {
    fetchConsent();
    fetchContributions();
  }, []);

  const fetchConsent = async () => {
    try {
      const res = await api.get('/marketplace/consent');
      setConsent(res.data);
      if (res.data.preferences) {
        setPreferences(res.data.preferences);
      }
    } catch (error) {
      console.error('Failed to load consent:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContributions = async () => {
    try {
      const res = await api.get('/marketplace/my-contributions');
      setContributions(res.data);
    } catch (error) {
      console.error('Failed to load contributions:', error);
    }
  };

  const handleOptIn = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/marketplace/consent', { preferences });
      setMessage({ type: 'success', text: 'Successfully opted in to the data marketplace!' });
      fetchConsent();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to opt in' });
    } finally {
      setSaving(false);
    }
  };

  const handleOptOut = async () => {
    if (!window.confirm('Are you sure you want to opt out? Your data will not be included in future datasets.')) {
      return;
    }

    setSaving(true);
    try {
      await api.delete('/marketplace/consent');
      setMessage({ type: 'success', text: 'Successfully opted out. Your data will not be included in future datasets.' });
      fetchConsent();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to opt out' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePreferences = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/marketplace/consent', { preferences });
      setMessage({ type: 'success', text: 'Preferences updated successfully!' });
      fetchConsent();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update preferences' });
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="container loading">Loading...</div>;
  }

  return (
    <div className="marketplace-page">
      <div className="container">
        <h1>Data Marketplace</h1>
        <p className="page-description">
          Contribute your dash cam footage to help train AI models, improve traffic safety research,
          and earn credits while maintaining full control over your privacy.
        </p>

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        {/* Status Banner */}
        <div className={`status-banner ${consent?.isOptedIn ? 'opted-in' : 'opted-out'}`}>
          <div className="status-icon">
            {consent?.isOptedIn ? '✓' : '○'}
          </div>
          <div className="status-text">
            <strong>{consent?.isOptedIn ? 'You are opted in' : 'You are not opted in'}</strong>
            <span>
              {consent?.isOptedIn
                ? 'Your footage is being contributed to datasets (with anonymization)'
                : 'Opt in to start contributing and earning credits'}
            </span>
          </div>
          <button
            className={consent?.isOptedIn ? 'btn-danger' : 'btn-primary'}
            onClick={consent?.isOptedIn ? handleOptOut : handleOptIn}
            disabled={saving}
          >
            {saving ? 'Processing...' : consent?.isOptedIn ? 'Opt Out' : 'Opt In'}
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'preferences' ? 'active' : ''}
            onClick={() => setActiveTab('preferences')}
          >
            Privacy Settings
          </button>
          <button
            className={activeTab === 'contributions' ? 'active' : ''}
            onClick={() => setActiveTab('contributions')}
          >
            My Contributions
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="info-cards">
              <div className="info-card">
                <div className="card-icon">🔒</div>
                <h3>Privacy First</h3>
                <p>
                  All footage is anonymized before inclusion. Faces and license plates are
                  automatically blurred. You control what data is shared.
                </p>
              </div>
              <div className="info-card">
                <div className="card-icon">💰</div>
                <h3>Earn Credits</h3>
                <p>
                  Earn credits for every file included in a dataset. Credits can be redeemed
                  for premium features or other rewards.
                </p>
              </div>
              <div className="info-card">
                <div className="card-icon">🌍</div>
                <h3>Make an Impact</h3>
                <p>
                  Your contributions help train AI for safer roads, improve traffic research,
                  and develop better safety technologies.
                </p>
              </div>
              <div className="info-card">
                <div className="card-icon">🎛️</div>
                <h3>Full Control</h3>
                <p>
                  Opt out anytime. Exclude specific incidents. Choose exactly what types
                  of data to share.
                </p>
              </div>
            </div>

            {consent?.isOptedIn && contributions && (
              <div className="stats-section">
                <h2>Your Statistics</h2>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-value">{contributions.statistics?.filesContributed || 0}</span>
                    <span className="stat-label">Files Contributed</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{contributions.statistics?.datasetsIncludedIn || 0}</span>
                    <span className="stat-label">Datasets Included In</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{contributions.creditsEarned || 0}</span>
                    <span className="stat-label">Credits Earned</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="tab-content">
            <div className="preferences-form">
              <h2>Privacy & Data Settings</h2>
              <p className="form-description">
                Control exactly what data is shared when your footage is included in datasets.
              </p>

              <div className="preference-section">
                <h3>Media Types</h3>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={preferences.allowVideoUsage}
                    onChange={(e) => handlePreferenceChange('allowVideoUsage', e.target.checked)}
                  />
                  <div>
                    <strong>Allow video usage</strong>
                    <span>Include your video files in datasets</span>
                  </div>
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={preferences.allowImageUsage}
                    onChange={(e) => handlePreferenceChange('allowImageUsage', e.target.checked)}
                  />
                  <div>
                    <strong>Allow image usage</strong>
                    <span>Include your image files in datasets</span>
                  </div>
                </label>
              </div>

              <div className="preference-section">
                <h3>Anonymization</h3>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={preferences.anonymizeFaces}
                    onChange={(e) => handlePreferenceChange('anonymizeFaces', e.target.checked)}
                  />
                  <div>
                    <strong>Blur faces</strong>
                    <span>Automatically detect and blur faces in footage</span>
                  </div>
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={preferences.anonymizePlates}
                    onChange={(e) => handlePreferenceChange('anonymizePlates', e.target.checked)}
                  />
                  <div>
                    <strong>Blur license plates</strong>
                    <span>Automatically detect and blur license plates</span>
                  </div>
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={preferences.removeAudio}
                    onChange={(e) => handlePreferenceChange('removeAudio', e.target.checked)}
                  />
                  <div>
                    <strong>Remove audio</strong>
                    <span>Strip audio tracks from videos</span>
                  </div>
                </label>
              </div>

              <div className="preference-section">
                <h3>Metadata</h3>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={preferences.allowTimeData}
                    onChange={(e) => handlePreferenceChange('allowTimeData', e.target.checked)}
                  />
                  <div>
                    <strong>Include time data</strong>
                    <span>Allow date/time information to be shared</span>
                  </div>
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={preferences.allowLocationData}
                    onChange={(e) => handlePreferenceChange('allowLocationData', e.target.checked)}
                  />
                  <div>
                    <strong>Include location data</strong>
                    <span>Allow approximate location (city-level) to be shared</span>
                  </div>
                </label>
              </div>

              {consent?.isOptedIn && (
                <button
                  className="btn-primary"
                  onClick={handleUpdatePreferences}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Contributions Tab */}
        {activeTab === 'contributions' && (
          <div className="tab-content">
            {!consent?.isOptedIn ? (
              <div className="empty-state">
                <p>Opt in to the marketplace to start contributing and earning credits.</p>
              </div>
            ) : contributions?.contributions?.length === 0 ? (
              <div className="empty-state">
                <p>No contributions yet. Your footage will be included in datasets as they are generated.</p>
              </div>
            ) : (
              <div className="contributions-list">
                <h2>Dataset Contributions</h2>
                {contributions?.contributions?.map((c, i) => (
                  <div key={i} className="contribution-card">
                    <div className="contribution-header">
                      <span className="dataset-name">{c.datasetName}</span>
                      <span className="dataset-purpose">{c.purpose}</span>
                    </div>
                    <div className="contribution-details">
                      <span>{c.filesCount} files</span>
                      <span>{c.creditsAwarded} credits</span>
                      <span>{new Date(c.contributedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Marketplace;
