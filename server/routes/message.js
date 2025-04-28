const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { authenticateToken } = require('../middleware/auth');

// Send a message
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { receiver, content } = req.body;
        if (!receiver || !content) return res.status(400).json({ message: 'Receiver and content required.' });
        const message = new Message({ sender: req.user.userId, receiver, content });
        await message.save();
        // Real-time emit (if needed)
        const io = req.app.get('io');
        if (io) io.to(receiver).emit('newMessage', message);
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get messages between two users
router.get('/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: req.user.userId, receiver: userId },
                { sender: userId, receiver: req.user.userId }
            ]
        }).sort('createdAt');
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Mark messages as read
router.put('/read/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        await Message.updateMany({ sender: userId, receiver: req.user.userId, read: false }, { read: true });
        res.json({ message: 'Messages marked as read.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
