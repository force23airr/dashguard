import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './DataPartners.css';

const DataPartners = () => {
  const { isAuthenticated } = useAuth();
  const [partners, setPartners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [connections, setConnections] = useState({ connections: [], totals: {} });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedPartner, setExpandedPartner] = useState(null);

  useEffect(() => {
    fetchPartners();
    fetchCategories();
    if (isAuthenticated) {
      fetchMyConnections();
    }
  }, [selectedCategory, isAuthenticated]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const params = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
      const res = await api.get(`/partners/data${params}`);
      setPartners(res.data.partners || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/partners/categories');
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMyConnections = async () => {
    try {
      const res = await api.get('/partners/my-connections?type=data');
      setConnections(res.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleConnect = async (partnerId) => {
    if (!isAuthenticated) {
      alert('Please log in to connect with partners');
      return;
    }

    try {
      await api.post(`/partners/data/${partnerId}/connect`);
      fetchPartners();
      fetchMyConnections();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to connect');
    }
  };

  const handleDisconnect = async (partnerId) => {
    try {
      await api.delete(`/partners/data/${partnerId}/disconnect`);
      fetchPartners();
      fetchMyConnections();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to disconnect');
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      ai_autonomous: '🤖',
      mapping: '🗺️',
      insurance: '🛡️',
      government: '🏛️',
      research: '🔬',
      weather: '🌦️',
      infrastructure: '🚧',
      other: '📊'
    };
    return icons[category] || '📊';
  };

  const formatPayRate = (rate, unit) => {
    const amount = (rate / 100).toFixed(2);
    const unitLabels = {
      per_minute: '/min',
      per_report: '/report',
      per_mb: '/MB',
      per_hour: '/hour',
      per_file: '/file'
    };
    return `$${amount}${unitLabels[unit] || ''}`;
  };

  return (
    <div className="data-partners-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1>Data Partners</h1>
          <p>Connect with companies that value your driving data and earn while you drive</p>

          {isAuthenticated && connections.totals && (
            <div className="earnings-summary">
              <div className="summary-stat">
                <span className="stat-value">
                  ${((connections.totals.totalCredits || 0) / 100).toFixed(2)}
                </span>
                <span className="stat-label">Total Earned</span>
              </div>
              <div className="summary-stat">
                <span className="stat-value">{connections.totals.totalPartners || 0}</span>
                <span className="stat-label">Connected Partners</span>
              </div>
              <div className="summary-stat">
                <span className="stat-value">{connections.totals.totalReports || 0}</span>
                <span className="stat-label">Reports Shared</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="container">
        {/* Category Filters */}
        <div className="category-filters">
          <button
            className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Partners
          </button>
          {categories.map((cat) => (
            <button
              key={cat.code}
              className={`category-btn ${selectedCategory === cat.code ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.code)}
            >
              {getCategoryIcon(cat.code)} {cat.name} ({cat.count})
            </button>
          ))}
        </div>

        {/* Partners Grid */}
        {loading ? (
          <div className="loading">Loading partners...</div>
        ) : partners.length === 0 ? (
          <div className="no-partners">
            <p>No partners found in this category.</p>
          </div>
        ) : (
          <div className="partners-grid">
            {partners.map((partner) => {
              const isExpanded = expandedPartner === partner._id;
              const userConnection = connections.connections?.find(
                (c) => c.partner?._id === partner._id
              );

              return (
                <div
                  key={partner._id}
                  className={`partner-card ${partner.isFeatured ? 'featured' : ''} ${
                    partner.isConnected ? 'connected' : ''
                  }`}
                >
                  <div className="partner-header">
                    <div className="partner-icon">{getCategoryIcon(partner.category)}</div>
                    <div className="partner-info">
                      <h3>{partner.name}</h3>
                      <span className="partner-category">{partner.categoryDisplay}</span>
                    </div>
                    {partner.isConnected && (
                      <span className="connected-badge">Connected</span>
                    )}
                    {partner.isFeatured && !partner.isConnected && (
                      <span className="featured-badge">Featured</span>
                    )}
                  </div>

                  <p className="partner-description">
                    {partner.shortDescription || partner.description}
                  </p>

                  <div className="pay-rates">
                    <h4>What They Pay For:</h4>
                    <ul>
                      {partner.dataInterests?.slice(0, 3).map((interest, idx) => (
                        <li key={idx}>
                          <span className="data-type">
                            {interest.type.replace(/_/g, ' ')}
                          </span>
                          <span className="pay-rate">
                            {formatPayRate(interest.payRate, interest.payUnit)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="partner-stats">
                    <div className="stat">
                      <span className="value">{partner.stats?.activeDrivers || 0}</span>
                      <span className="label">Drivers</span>
                    </div>
                    <div className="stat">
                      <span className="value">
                        ${((partner.stats?.averageEarningsPerDriver || 0) / 100).toFixed(0)}/mo
                      </span>
                      <span className="label">Avg Earnings</span>
                    </div>
                  </div>

                  {partner.isConnected && userConnection && (
                    <div className="user-earnings">
                      <span>Your earnings: </span>
                      <strong>${((userConnection.earnings?.total || 0) / 100).toFixed(2)}</strong>
                    </div>
                  )}

                  <div className="partner-actions">
                    {partner.isConnected ? (
                      <>
                        <button
                          className="btn btn-outline"
                          onClick={() => setExpandedPartner(isExpanded ? null : partner._id)}
                        >
                          {isExpanded ? 'Hide Details' : 'Manage'}
                        </button>
                        <button
                          className="btn btn-danger-outline"
                          onClick={() => handleDisconnect(partner._id)}
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleConnect(partner._id)}
                      >
                        Connect
                      </button>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="expanded-details">
                      <h4>Full Description</h4>
                      <p>{partner.description}</p>

                      <h4>All Data Types</h4>
                      <ul className="full-data-types">
                        {partner.dataInterests?.map((interest, idx) => (
                          <li key={idx}>
                            <span className="type-name">
                              {interest.type.replace(/_/g, ' ')}
                            </span>
                            <span className="type-rate">
                              {formatPayRate(interest.payRate, interest.payUnit)}
                            </span>
                            {interest.description && (
                              <span className="type-desc">{interest.description}</span>
                            )}
                          </li>
                        ))}
                      </ul>

                      {partner.streaming?.enabled && (
                        <div className="streaming-info">
                          <h4>Real-Time Streaming Available</h4>
                          <p>
                            This partner accepts live video streams. Requirements:{' '}
                            {partner.streaming.qualityRequirements?.minResolution || '720p'} min,{' '}
                            {partner.streaming.qualityRequirements?.minFps || 15} FPS
                          </p>
                        </div>
                      )}

                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="partner-website"
                        >
                          Visit Website →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Info Section */}
        <div className="info-section">
          <div className="info-card">
            <h3>How It Works</h3>
            <ol>
              <li>Browse partners and see what data they need</li>
              <li>Click "Connect" to share your driving data</li>
              <li>Earn credits automatically when you contribute</li>
              <li>Cash out your earnings in the Rewards Dashboard</li>
            </ol>
          </div>
          <div className="info-card">
            <h3>Your Data, Your Control</h3>
            <ul>
              <li>Connect and disconnect at any time</li>
              <li>Choose which partners receive your data</li>
              <li>All personal info is anonymized</li>
              <li>Faces and plates are automatically blurred</li>
            </ul>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="cta-section">
            <h2>Start Earning Today</h2>
            <p>Create a free account to connect with data partners and monetize your dash cam footage.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                Sign Up Free
              </Link>
              <Link to="/get-rewarded" className="btn btn-outline btn-lg">
                Learn More
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataPartners;
