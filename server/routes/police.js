import express from 'express';
import {
  getPoliceStations,
  getPoliceStationById,
  getNearbyStations,
  createPoliceStation,
  updatePoliceStation,
  deletePoliceStation,
  createPoliceReport,
  getIncidentPoliceReports,
  getPoliceReport
} from '../controllers/policeController.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

// Public routes
router.get('/stations', getPoliceStations);
router.get('/stations/nearby', getNearbyStations);
router.get('/stations/:id', getPoliceStationById);

// Admin routes
router.post('/stations', admin, createPoliceStation);
router.put('/stations/:id', admin, updatePoliceStation);
router.delete('/stations/:id', admin, deletePoliceStation);

// Police report routes (on incidents)
router.post('/incidents/:id/report', auth, createPoliceReport);
router.get('/incidents/:id/reports', auth, getIncidentPoliceReports);
router.get('/incidents/:id/report/:reportId', auth, getPoliceReport);

export default router;
