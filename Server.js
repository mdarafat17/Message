const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const { v4: uuidv4 } = require('uuid'); // Use to generate unique IDs

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Serve static files (frontend HTML, CSS, JS)
app.use(express.static(__dirname));

// Handle room creation (create unique link)
app.get('/', (req, res) => {
    const roomId = uuidv4(); // Generate unique room ID
    res.redirect(`/${roomId}`); // Redirect to unique room URL
});

app.get('/:room', (req, res) => {
    res.sendFile(__dirname + '/index.html'); // Serve the chat UI for a specific room
});

// Handle Socket.io connections
io.on('connection', (socket) => {
    console.log('New connection...');

    // When a user joins a room
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId); // Join a specific room
        console.log(`User joined room: ${roomId}`);

        // Send a welcome message to the new user in the room
        socket.emit('message', 'Welcome to the Private Chat Room!');

        // Notify others in the room about the new user
        socket.broadcast.to(roomId).emit('message', 'A new user has joined the chat.');

        // Listen for chat messages
        socket.on('chatMessage', ({ message, roomId }) => {
            io.to(roomId).emit('message', message); // Broadcast message to everyone in the room
        });

        // Handle user disconnect
        socket.on('disconnect', () => {
            io.to(roomId).emit('message', 'A user has left the chat.');
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
