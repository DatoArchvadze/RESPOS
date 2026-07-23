const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('✅ ახალი კლიენტი დაუკავშირდა:', socket.id);

  // მიმტანი აგზავნის ახალ შეკვეთას
  socket.on('new-order-placed', (order) => {
    io.emit('new-order-placed', order); // ეგზავნება სამზარეულოს
  });

  // სამზარეულო ასრულებს შეკვეთას
  socket.on('dish-ready', (orderId) => {
    io.emit('dish-ready', orderId); // ეგზავნება მიმტანს (Order History-სთვის)
  });

  socket.on('disconnect', () => {
    console.log('❌ კლიენტი გაითიშა:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(` Socket.io სერვერი გაშვებულია პორტზე: ${PORT}`);
});