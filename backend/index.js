const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// CORS સેટિંગ્સ: હવે Vercel અને કોઈપણ હોસ્ટિંગ પ્લેટફોર્મને એક્સેસ મળશે
const io = new Server(server, {
  cors: {
    origin: "*", // "*" રાખવાથી Vercel અથવા કોઈપણ શેર કરેલી લિંક બ્લોક નહીં થાય
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // ૧. રૂમ જોઈન કરવાનો હેન્ડલર (બંને પ્રકારની ઈવેન્ટ્સ સપોર્ટ કરશે)
  const handleJoin = (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
    socket.to(roomId).emit('playerJoined', socket.id);
  };

  socket.on('joinRoom', handleJoin);
  socket.on('join-room', handleJoin);

  // ૨. ચેસ મુવ બ્રોડકાસ્ટ કરવાનો હેન્ડલર
  const handleMove = ({ roomId, moveData, move }) => {
    const dataToSend = moveData || move;
    socket.to(roomId).emit('oppMove', dataToSend);
    socket.to(roomId).emit('move', dataToSend);
  };

  socket.on('chessMove', handleMove);
  socket.on('move', handleMove);

  // ૩. લાઈવ ચેટ મેસેજ બ્રોડકાસ્ટ કરવાનો હેન્ડલર
  const handleChat = ({ roomId, msgData, message }) => {
    const dataToSend = msgData || message;
    console.log(`New message in room ${roomId}:`, dataToSend);
    socket.to(roomId).emit('chatMessage', dataToSend);
    socket.to(roomId).emit('chat-message', dataToSend);
  };

  socket.on('sendChatMessage', handleChat);
  socket.on('chat-message', handleChat);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Render માટે PORT ડિરેક્ટલી પકડવો પડે
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
