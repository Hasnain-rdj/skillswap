const Project = require('../models/Project');

// Create a new project
exports.createProject = async (req, res) => {
    try {
        const { title, description, requirements, deadline } = req.body;
        const clientId = req.body.clientId || req.user?.userId; // support for JWT middleware
        if (!title || !description || !clientId) {
            return res.status(400).json({ message: 'Title, description, and clientId are required.' });
        }
        const project = new Project({
            title,
            description,
            requirements,
            deadline,
            clientId,
        });
        await project.save();
        res.status(201).json({ message: 'Project created successfully.', project });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get all projects
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find().populate('clientId', 'name email');
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get a single project by ID
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('clientId', 'name email');
        if (!project) return res.status(404).json({ message: 'Project not found.' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Update a project
exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!project) return res.status(404).json({ message: 'Project not found.' });
        res.json({ message: 'Project updated.', project });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Delete a project
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found.' });
        res.json({ message: 'Project deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Add a bid to a project
exports.addBid = async (req, res) => {
    try {
        const { id } = req.params;
        const { freelancerId, message, amount } = req.body;
        if (!freelancerId || !amount) {
            return res.status(400).json({ message: 'Freelancer ID and amount are required.' });
        }
        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ message: 'Project not found.' });
        project.bids.push({ freelancerId, message, amount });
        await project.save();
        // Emit real-time bid update to project room
        const io = req.app.get('io');
        if (io) io.to(id).emit('bidUpdate', { projectId: id, bids: project.bids });
        res.status(201).json({ message: 'Bid added.', bids: project.bids });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Edit a bid on a project
exports.editBid = async (req, res) => {
    try {
        const { id, bidId } = req.params;
        const { message, amount, status } = req.body;
        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ message: 'Project not found.' });
        const bid = project.bids.id(bidId);
        if (!bid) return res.status(404).json({ message: 'Bid not found.' });
        if (message !== undefined) bid.message = message;
        if (amount !== undefined) bid.amount = amount;
        if (status !== undefined) bid.status = status;
        await project.save();
        // Emit real-time bid update to project room
        const io = req.app.get('io');
        if (io) io.to(id).emit('bidUpdate', { projectId: id, bids: project.bids });
        res.json({ message: 'Bid updated.', bid });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get all bids for a project
exports.getBids = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id).populate('bids.freelancerId', 'name email');
        if (!project) return res.status(404).json({ message: 'Project not found.' });
        res.json(project.bids);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};