import express from 'express';
import {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
  getUserIncidents
} from '../controllers/incidentController.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getIncidents);
router.get('/:id', getIncidentById);
router.get('/user/:userId', getUserIncidents);
router.post('/', auth, upload.array('media', 5), createIncident);
router.put('/:id', auth, updateIncident);
router.delete('/:id', auth, deleteIncident);

export default router;
