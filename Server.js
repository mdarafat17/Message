const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Serve static files
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Handle socket connection
io.on('connection', (socket) => {
    console.log('New user connected');

    // When a user joins a room
    socket.on('joinRoom', (roomCode) => {
        socket.join(roomCode);
        console.log(`User joined room: ${roomCode}`);

        // Notify the new user
        socket.emit('message', 'Welcome to the chat!');

        // Notify others in the room
        socket.broadcast.to(roomCode).emit('message', 'A new user has joined the chat');

        // Listen for chat messages
        socket.on('chatMessage', (msg) => {
            io.to(roomCode).emit('message', msg); // Broadcast to the room
            socket.emit('myMessage', msg); // Display own message
        });

        // Handle user disconnect
        socket.on('disconnect', () => {
            io.to(roomCode).emit('message', 'A user has left the chat');
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
