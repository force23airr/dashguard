import { useState } from 'react';
import api from '../services/api';
import './PlateDetection.css';

const PlateDetection = ({ incident, isOwner, onUpdate }) => {
  const [detecting, setDetecting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [plateRegion, setPlateRegion] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const handleDetectPlates = async () => {
    setDetecting(true);
    try {
      const res = await api.post(`/plates/detect/${incident._id}`);
      if (onUpdate) onUpdate();
      alert(`Detection complete! Found ${res.data.totalDetected} plates, ${res.data.newPlatesAdded} new.`);
    } catch (error) {
      console.error('Plate detection error:', error);
      alert('Plate detection failed. Please try again.');
    } finally {
      setDetecting(false);
    }
  };

  const handleAddPlate = async (e) => {
    e.preventDefault();
    if (!newPlate.trim()) return;

    try {
      await api.post(`/plates/incident/${incident._id}/add`, {
        plate: newPlate.trim().toUpperCase(),
        region: plateRegion || undefined,
        vehicleType: vehicleType || undefined
      });
      setNewPlate('');
      setPlateRegion('');
      setVehicleType('');
      setShowAddForm(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add plate');
    }
  };

  const handleRemovePlate = async (plateId) => {
    if (!window.confirm('Remove this plate?')) return;

    try {
      await api.delete(`/plates/incident/${incident._id}/${plateId}`);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error removing plate:', error);
    }
  };

  const handleVerifyPlate = async (plateId) => {
    try {
      await api.put(`/plates/incident/${incident._id}/${plateId}/verify`);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error verifying plate:', error);
    }
  };

  const handleSearchPlate = async (plate) => {
    setSearching(true);
    setSearchQuery(plate);
    try {
      const res = await api.get(`/plates/history/${plate}`);
      setSearchResults(res.data);
    } catch (error) {
      console.error('Error searching plate:', error);
    } finally {
      setSearching(false);
    }
  };

  const plates = incident.detectedPlates || [];

  return (
    <div className="plate-detection">
      <div className="plate-header">
        <h3>License Plates</h3>
        {isOwner && incident.mediaFiles?.length > 0 && (
          <button
            onClick={handleDetectPlates}
            disabled={detecting}
            className="btn btn-sm btn-secondary"
          >
            {detecting ? 'Detecting...' : 'Auto-Detect Plates'}
          </button>
        )}
      </div>

      {plates.length > 0 ? (
        <div className="plates-list">
          {plates.map((plate) => (
            <div key={plate._id} className={`plate-item ${plate.isVerified ? 'verified' : ''}`}>
              <div className="plate-main">
                <span className="plate-number">{plate.plate}</span>
                {plate.isVerified && <span className="verified-badge">Verified</span>}
                {plate.confidence && (
                  <span className="confidence">{plate.confidence}% confidence</span>
                )}
              </div>
              <div className="plate-details">
                {plate.region && <span>Region: {plate.region}</span>}
                {plate.vehicleType && <span>Vehicle: {plate.vehicleType}</span>}
                {plate.sourceFile && <span>From: {plate.sourceFile}</span>}
              </div>
              <div className="plate-actions">
                <button
                  onClick={() => handleSearchPlate(plate.plate)}
                  className="btn-link"
                  title="Check plate history"
                >
                  History
                </button>
                {isOwner && !plate.isVerified && (
                  <button
                    onClick={() => handleVerifyPlate(plate._id)}
                    className="btn-link"
                    title="Verify this plate"
                  >
                    Verify
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={() => handleRemovePlate(plate._id)}
                    className="btn-link text-danger"
                    title="Remove plate"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-plates">No license plates detected yet.</p>
      )}

      {isOwner && (
        <div className="add-plate-section">
          {showAddForm ? (
            <form onSubmit={handleAddPlate} className="add-plate-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="License plate (e.g., ABC1234)"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                  maxLength={10}
                  required
                />
                <input
                  type="text"
                  placeholder="State/Region (optional)"
                  value={plateRegion}
                  onChange={(e) => setPlateRegion(e.target.value)}
                  maxLength={20}
                />
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                >
                  <option value="">Vehicle type</option>
                  <option value="car">Car</option>
                  <option value="truck">Truck</option>
                  <option value="suv">SUV</option>
                  <option value="van">Van</option>
                  <option value="motorcycle">Motorcycle</option>
                </select>
              </div>
              <div className="form-buttons">
                <button type="submit" className="btn btn-sm btn-primary">Add Plate</button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-sm btn-outline"
            >
              + Add Plate Manually
            </button>
          )}
        </div>
      )}

      {searchResults && (
        <div className="plate-history-modal">
          <div className="plate-history-content">
            <div className="plate-history-header">
              <h4>History for {searchQuery}</h4>
              <button onClick={() => setSearchResults(null)}>&times;</button>
            </div>
            <div className="plate-history-body">
              {searching ? (
                <p>Searching...</p>
              ) : searchResults.found ? (
                <>
                  <p className={searchResults.isRepeatOffender ? 'repeat-offender' : ''}>
                    {searchResults.isRepeatOffender
                      ? `REPEAT OFFENDER - ${searchResults.count} incidents`
                      : `Found in ${searchResults.count} incident(s)`}
                  </p>
                  <ul className="history-list">
                    {searchResults.incidents.map((inc) => (
                      <li key={inc._id}>
                        <a href={`/incidents/${inc._id}`} target="_blank" rel="noopener noreferrer">
                          {inc.title}
                        </a>
                        <span className="history-meta">
                          {inc.type} - {inc.severity} - {new Date(inc.createdAt).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>No previous incidents found for this plate.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlateDetection;
