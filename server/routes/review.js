const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { authenticateToken } = require('../middleware/auth');

// Post a review (client)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { projectId, freelancerId, rating, comment } = req.body;
        if (!projectId || !freelancerId || !rating) return res.status(400).json({ message: 'Missing required fields.' });
        const review = new Review({
            projectId,
            clientId: req.user.userId,
            freelancerId,
            rating,
            comment
        });
        await review.save();
        res.status(201).json(review);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get reviews for a freelancer
router.get('/freelancer/:freelancerId', async (req, res) => {
    try {
        const { freelancerId } = req.params;
        const { rating, date } = req.query;
        let query = { freelancerId };
        if (rating) query.rating = Number(rating);
        let reviews = await Review.find(query).sort('-createdAt');
        if (date) {
            // Filter by date (YYYY-MM-DD)
            reviews = reviews.filter(r => r.createdAt.toISOString().startsWith(date));
        }
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Freelancer responds to a review
router.put('/:reviewId/response', authenticateToken, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { response } = req.body;
        const review = await Review.findByIdAndUpdate(reviewId, { response }, { new: true });
        res.json(review);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get average rating for a freelancer
router.get('/freelancer/:freelancerId/average', async (req, res) => {
    try {
        const { freelancerId } = req.params;
        const reviews = await Review.find({ freelancerId });
        const avg = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2) : 0;
        res.json({ average: avg });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
