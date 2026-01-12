import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  detectPlatesFromIncident,
  getIncidentPlates,
  getPlateHistory,
  addPlateManually,
  removePlate,
  verifyPlate,
  searchByPlate,
  getFlaggedPlates,
  getPlateStats
} from '../controllers/plateController.js';

const router = express.Router();

// Public routes (no auth required)
router.get('/flagged', getFlaggedPlates);
router.get('/stats', getPlateStats);

// Protected routes require authentication
router.use(auth);

// Detect plates from incident media files
router.post('/detect/:incidentId', detectPlatesFromIncident);

// Get plates for a specific incident
router.get('/incident/:incidentId', getIncidentPlates);

// Search incidents by plate number
router.get('/search', searchByPlate);

// Get history for a specific plate
router.get('/history/:plate', getPlateHistory);

// Manually add a plate to an incident
router.post('/incident/:incidentId/add', addPlateManually);

// Remove a plate from an incident
router.delete('/incident/:incidentId/:plateId', removePlate);

// Verify a detected plate
router.put('/incident/:incidentId/:plateId/verify', verifyPlate);

export default router;
