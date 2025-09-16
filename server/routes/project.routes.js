const express = require('express');
const projectController = require('../controllers/project.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Protected routes
router.use(authenticate); // Apply authentication middleware to all routes below

router.get('/me', projectController.getCurrentUserProjects);

// Public routes
router.get('/enriched/:username', projectController.getEnrichedUserProjects);
router.get('/user/:userId', projectController.getUserProjects);
router.get('/username/:username', projectController.getUserProjects);
router.get('/:id', projectController.getProject);

router.post('/', projectController.createProject);
router.patch('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.post('/:id/image', projectController.upload.single('image'), projectController.uploadProjectImage);
router.post('/reorder', projectController.reorderProjects);
router.post('/visibility', projectController.updateProjectVisibility);

module.exports = router;