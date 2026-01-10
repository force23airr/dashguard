import express from 'express';
import {
  getHeatmap,
  getTrends,
  getPeakHours,
  getByType,
  getBySeverity,
  getByLocation,
  getSummary,
  createExportJob,
  getExportJobStatus,
  downloadExport,
  getUserExportJobs
} from '../controllers/analyticsController.js';
import auth from '../middleware/auth.js';
import { exportLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// All analytics routes require authentication
router.use(auth);

// Analytics data endpoints
router.get('/heatmap', getHeatmap);
router.get('/trends', getTrends);
router.get('/peak-hours', getPeakHours);
router.get('/by-type', getByType);
router.get('/by-severity', getBySeverity);
router.get('/by-location', getByLocation);
router.get('/summary', getSummary);

// Export endpoints
router.post('/export', exportLimiter, createExportJob);
router.get('/exports', getUserExportJobs);
router.get('/export/:jobId', getExportJobStatus);
router.get('/export/:jobId/download', downloadExport);

export default router;
