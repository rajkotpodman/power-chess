const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], 
    methods: ["GET", "POST"]
  }
});

const games = {}; // To store game states for each room

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
    
    // Notify others in room
    socket.to(roomId).emit('playerJoined', socket.id);
  });

  socket.on('chessMove', ({ roomId, moveData }) => {
    // Broadcast to everyone else in the specific room
    socket.to(roomId).emit('oppMove', moveData);
  });

  // 💬 લાઇવ ચેટ માટેનો નવો ઇવેન્ટ હેન્ડલર
  socket.on('sendChatMessage', ({ roomId, msgData }) => {
    console.log(`New message in room ${roomId} from ${msgData.sender}: ${msgData.text}`);
    // મેસેજ મોકલનાર સિવાય, રૂમમાં હાજર બીજા પ્લેયરને રિયલ-ટાઇમમાં બ્રોડકાસ્ટ કરો
    socket.to(roomId).emit('chatMessage', msgData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Backend server running on port 3000');
});