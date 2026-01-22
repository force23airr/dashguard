import express from 'express';
import {
  createClaim,
  submitWitnessReport,
  getUserClaims,
  getClaimById,
  updateClaim,
  deleteClaim,
  submitClaim,
  downloadClaimPDF,
  getClaimJSON,
  apiGetClaims,
  apiGetClaimById,
  apiUpdateClaimStatus,
  apiVerifyClaim,
  createApiKey,
  getApiKeys,
  updateApiKey,
  deleteApiKey
} from '../controllers/insuranceController.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';
import { apiKeyAuth, requirePermission } from '../middleware/apiKeyAuth.js';
import { apiKeyLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// ==================== USER ROUTES ====================

// Claim management (authenticated users)
router.post('/claims', auth, createClaim);
router.post('/witness-report', auth, submitWitnessReport);
router.get('/claims', auth, getUserClaims);
router.get('/claims/:id', auth, getClaimById);
router.put('/claims/:id', auth, updateClaim);
router.delete('/claims/:id', auth, deleteClaim);
router.post('/claims/:id/submit', auth, submitClaim);
router.get('/claims/:id/pdf', auth, downloadClaimPDF);
router.get('/claims/:id/json', auth, getClaimJSON);

// ==================== ADMIN ROUTES ====================

// API key management (admin only)
router.post('/api-keys', admin, createApiKey);
router.get('/api-keys', admin, getApiKeys);
router.put('/api-keys/:id', admin, updateApiKey);
router.delete('/api-keys/:id', admin, deleteApiKey);

export default router;

// ==================== EXTERNAL API ROUTES (v1) ====================
// These are exported separately and mounted at /api/v1/insurance

export const insuranceApiRouter = express.Router();

// Apply API key auth and rate limiting to all v1 routes
insuranceApiRouter.use(apiKeyAuth);
insuranceApiRouter.use(apiKeyLimiter);

// API routes
insuranceApiRouter.get('/claims', requirePermission('readClaims'), apiGetClaims);
insuranceApiRouter.get('/claims/:claimId', requirePermission('readClaims'), apiGetClaimById);
insuranceApiRouter.post('/claims/:claimId/status', requirePermission('writeClaims'), apiUpdateClaimStatus);
insuranceApiRouter.post('/verify', apiVerifyClaim);
