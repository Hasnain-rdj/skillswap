const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    amount: Number,
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: { type: String },
    deadline: { type: Date },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'in progress', 'completed', 'cancelled'], default: 'open' },
    bids: [bidSchema],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Project', projectSchema);