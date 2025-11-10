const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

// Track connected clients
const clients = new Set();

wss.on('connection', function connection(ws) {
  console.log('✅ WebSocket client connected');
  clients.add(ws);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    data: 'Connected to WebSocket server',
    timestamp: Date.now()
  }));

  ws.on('message', function message(data) {
    console.log('Received:', data.toString());
    
    try {
      // Try to parse JSON message
      const parsedData = JSON.parse(data);
      console.log('Parsed message:', parsedData);
    } catch (e) {
      console.log('Raw message received');
    }
    
    // Echo back with additional info
    ws.send(JSON.stringify({
      type: 'echo',
      data: 'Message received',
      original: data.toString(),
      timestamp: Date.now()
    }));
  });

  // Heartbeat interval
  const heartbeat = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'heartbeat',
        data: { 
          status: 'connected',
          clientCount: clients.size
        },
        timestamp: Date.now()
      }));
    }
  }, 30000);

  ws.on('close', function close() {
    console.log('❌ WebSocket client disconnected');
    clients.delete(ws);
    clearInterval(heartbeat);
  });

  ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
    clients.delete(ws);
  });
});

// Broadcast to all connected clients
function broadcast(message) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

console.log('🚀 WebSocket server running on ws://localhost:3000');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down WebSocket server...');
  wss.close();
  process.exit(0);
});

module.exports = { wss, broadcast };