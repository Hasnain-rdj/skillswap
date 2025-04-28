const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Create a new project
router.post('/', authenticateToken, authorizeRoles('client'), projectController.createProject);
// Get all projects
router.get('/', projectController.getProjects);
// Get a single project by ID
router.get('/:id', projectController.getProjectById);
// Update a project
router.put('/:id', authenticateToken, authorizeRoles('client'), projectController.updateProject);
// Delete a project
router.delete('/:id', authenticateToken, authorizeRoles('client'), projectController.deleteProject);
// Bid management
router.post('/:id/bids', authenticateToken, authorizeRoles('freelancer'), projectController.addBid);
router.put('/:id/bids/:bidId', authenticateToken, authorizeRoles('freelancer', 'client'), projectController.editBid);
router.get('/:id/bids', authenticateToken, projectController.getBids);

module.exports = router;