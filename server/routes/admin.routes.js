const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all admin routes
router.use(authenticate);
router.use(isAdmin);

router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.post('/users', adminController.createUser);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/stats', adminController.getStats);

module.exports = router;
