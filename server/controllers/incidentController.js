import Incident from '../models/Incident.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all incidents
// @route   GET /api/incidents
export const getIncidents = async (req, res) => {
  try {
    const { type, severity, status, limit = 20, page = 1 } = req.query;

    const query = {};
    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (status) query.status = status;

    const incidents = await Incident.find(query)
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Incident.countDocuments(query);

    res.json({
      incidents,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single incident
// @route   GET /api/incidents/:id
export const getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('user', 'username avatar');

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create incident
// @route   POST /api/incidents
export const createIncident = async (req, res) => {
  try {
    const { title, description, type, severity, location } = req.body;

    // Process uploaded files
    const mediaFiles = req.files ? req.files.map(file => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      mimetype: file.mimetype
    })) : [];

    const incident = await Incident.create({
      user: req.user._id,
      title,
      description,
      type,
      severity,
      location: JSON.parse(location),
      mediaFiles
    });

    await incident.populate('user', 'username avatar');

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update incident
// @route   PUT /api/incidents/:id
export const updateIncident = async (req, res) => {
  try {
    let incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    // Check ownership
    if (incident.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this incident' });
    }

    const { title, description, type, severity, status, location } = req.body;
    const updateFields = {};

    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (type) updateFields.type = type;
    if (severity) updateFields.severity = severity;
    if (status) updateFields.status = status;
    if (location) updateFields.location = JSON.parse(location);

    incident = await Incident.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('user', 'username avatar');

    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete incident
// @route   DELETE /api/incidents/:id
export const deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    // Check ownership
    if (incident.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this incident' });
    }

    // Delete associated files
    incident.mediaFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', 'uploads', file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await incident.deleteOne();

    res.json({ message: 'Incident deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's incidents
// @route   GET /api/incidents/user/:userId
export const getUserIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({ user: req.params.userId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
