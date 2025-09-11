const io = require('socket.io-client');

const baseURL = 'https://masai-hackathon.onrender.com';
// const baseURL = 'http://localhost:5009';

console.log('🔌 Testing WebSocket connection...');

// Test with a fake token first
const socket = io(baseURL, {
  auth: {
    token: 'test-token-123'
  },
  transports: ['websocket', 'polling'],
  timeout: 10000
});

socket.on('connect', () => {
  console.log('✅ WebSocket connected successfully');
  console.log('Socket ID:', socket.id);
  
  // Test basic ping
  socket.emit('ping');
});

socket.on('connect_error', (error) => {
  console.error('❌ WebSocket connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('🔴 WebSocket disconnected:', reason);
});

socket.on('pong', () => {
  console.log('🏓 Pong received - connection is working');
});

// Test chat message event
socket.on('chat_message', (data) => {
  console.log('💬 Received chat message:', data);
});

// Test vote update event
socket.on('vote_update', (data) => {
  console.log('🗳️ Received vote update:', data);
});

// Test poll update event
socket.on('poll_update', (data) => {
  console.log('📊 Received poll update:', data);
});

setTimeout(() => {
  console.log('⏰ Test completed');
  socket.disconnect();
  process.exit(0);
}, 5000);
