require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const connectDB = require('./utils/db');

connectDB();

app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'SkillSwap server is running!' });
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const projectRoutes = require('./routes/project');
app.use('/api/projects', projectRoutes);

const messageRoutes = require('./routes/message');
app.use('/api/messages', messageRoutes);

const reviewRoutes = require('./routes/review');
app.use('/api/reviews', reviewRoutes);

const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Socket.io events for real-time bidding
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('joinProjectRoom', (projectId) => {
        socket.join(projectId);
    });
    socket.on('leaveProjectRoom', (projectId) => {
        socket.leave(projectId);
    });
    // You can add more events as needed
});

app.set('io', io); // Make io accessible in controllers

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});