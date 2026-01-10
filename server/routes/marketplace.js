import express from 'express';
import {
  getConsent,
  optIn,
  updateConsent,
  optOut,
  getContributions,
  getEarnings,
  excludeIncident,
  getDatasets,
  getDatasetById,
  createDataset,
  generateDataset,
  updateDataset,
  archiveDataset
} from '../controllers/marketplaceController.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';
import { apiKeyAuth, requirePermission } from '../middleware/apiKeyAuth.js';
import { apiKeyLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// ==================== USER CONSENT ROUTES ====================

// Consent management (authenticated users)
router.get('/consent', auth, getConsent);
router.post('/consent', auth, optIn);
router.put('/consent', auth, updateConsent);
router.delete('/consent', auth, optOut);

// User contributions and earnings
router.get('/my-contributions', auth, getContributions);
router.get('/my-earnings', auth, getEarnings);
router.post('/exclude-incident/:incidentId', auth, excludeIncident);

// ==================== ADMIN DATASET ROUTES ====================

// Dataset management (admin only)
router.get('/datasets', admin, getDatasets);
router.get('/datasets/:id', admin, getDatasetById);
router.post('/datasets', admin, createDataset);
router.post('/datasets/:id/generate', admin, generateDataset);
router.put('/datasets/:id', admin, updateDataset);
router.delete('/datasets/:id', admin, archiveDataset);

export default router;

// ==================== EXTERNAL API ROUTES (v1) ====================
// These are exported separately and mounted at /api/v1/marketplace

export const marketplaceApiRouter = express.Router();

// Apply API key auth and rate limiting to all v1 routes
marketplaceApiRouter.use(apiKeyAuth);
marketplaceApiRouter.use(apiKeyLimiter);

// API routes for dataset access
marketplaceApiRouter.get('/datasets', requirePermission('readDatasets'), getDatasets);
marketplaceApiRouter.get('/datasets/:id', requirePermission('readDatasets'), getDatasetById);
