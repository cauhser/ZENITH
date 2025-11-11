import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import express from 'express';
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
app.use(express.json());
app.use(express.static('dist'));
const clients = new Set();
wss.on('connection', (ws) => {
  console.log('🔗 New WebSocket connection');
  clients.add(ws);
  ws.send(JSON.stringify({
    type: 'CONNECTION_ESTABLISHED',
    message: 'Connected to ZENITH Wellness Server',
    timestamp: Date.now()
  }));
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('📨 Received message:', message.type);
      switch (message.type) {
        case 'PING':
          ws.send(JSON.stringify({
            type: 'PONG',
            timestamp: Date.now()
          }));
          break;
        case 'EMOTION_UPDATE':
          broadcast({
            type: 'EMOTION_UPDATE',
            payload: message.payload,
            timestamp: Date.now()
          });
          break;
        case 'CONTENT_TRIGGER':
          broadcast({
            type: 'CONTENT_TRIGGER',
            payload: message.payload,
            timestamp: Date.now()
          });
          break;
        case 'BREAK_REMINDER':
          broadcast({
            type: 'BREAK_REMINDER',
            payload: message.payload,
            timestamp: Date.now()
          });
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  ws.on('close', () => {
    console.log('🔌 WebSocket connection closed');
    clients.delete(ws);
  });
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});
function broadcast(message) {
  const data = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === 1) { 
      client.send(data);
    }
  });
}
function broadcastCampusPulse() {
  const campuses = ['HKU', 'CUHK', 'PolyU', 'CityU'];
  const topics = ['FYP', 'exam', 'ghosted', 'internship', 'research', 'career'];
  const campus = campuses[Math.floor(Math.random() * campuses.length)];
  const trendingTopic = topics[Math.floor(Math.random() * topics.length)];
  const percentage = Math.floor(Math.random() * 40) + 50; 
  const campusPulseData = {
    campus,
    trendingTopic,
    percentage,
    message: `"${trendingTopic}" spiking (${percentage}% today)`
  };
  broadcast({
    type: 'CAMPUS_PULSE_UPDATE',
    payload: campusPulseData,
    timestamp: Date.now()
  });
}
setInterval(broadcastCampusPulse, 30000);
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: Date.now(),
    connectedClients: clients.size
  });
});
app.get('/api/analytics', (req, res) => {
  res.json({
    message: 'Analytics endpoint',
    timestamp: Date.now()
  });
});
app.post('/api/wellness-data', (req, res) => {
  console.log('Received wellness data:', req.body);
  res.json({ status: 'success', received: true });
});
app.get('*', (req, res) => {
  res.sendFile(process.cwd() + '/dist/index.html');
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 ZENITH Wellness Server running on port ${PORT}`);
  console.log(`📊 WebSocket server ready for connections`);
  console.log(`🌐 Health check available at http://localhost:${PORT}/health`);
});
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  wss.close(() => {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});