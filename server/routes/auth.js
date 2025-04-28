// Importing necessary modules
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authController = require('../controllers/authController');

// Verification route
router.post('/verify', authController.verify);
// Password reset route
router.post('/reset-password', authController.resetPassword);
// Register route
router.post('/register', authController.register);
// Login route
router.post('/login', authController.login);

// Freelancer search & filtering
router.get('/freelancers', async (req, res) => {
    try {
        const { name, email, skill } = req.query;
        let query = { role: 'freelancer' };
        if (name) query.name = { $regex: name, $options: 'i' };
        if (email) query.email = { $regex: email, $options: 'i' };
        // Add skill filtering if skills are added to User model in future
        const freelancers = await User.find(query).select('-password');
        res.json(freelancers);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;