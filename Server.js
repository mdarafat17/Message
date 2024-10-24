const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Handle Socket.io connections
io.on('connection', (socket) => {
    console.log('New connection...');

    // When a user joins a room
    socket.on('joinRoom', (roomCode) => {
        socket.join(roomCode); // Join the specific room
        console.log(`User joined room: ${roomCode}`);

        // Send a welcome message to the new user in the room
        socket.emit('message', 'Welcome to the Private Chat Room!');

        // Notify others in the room about the new user
        socket.broadcast.to(roomCode).emit('message', 'A new user has joined the chat.');

        // Listen for chat messages
        socket.on('chatMessage', (message) => {
            io.to(roomCode).emit('message', message); // Broadcast message to everyone in the room
        });

        // Handle user disconnect
        socket.on('disconnect', () => {
            io.to(roomCode).emit('message', 'A user has left the chat.');
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
