const express = require('express')
const WebSocket = require('ws');
const app = express()
const port = 3000

// Initialize WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// WebSocket event handling
wss.on('connection', (ws) => {
  console.log('A new client connected.');

  // Event listener for incoming messages
  ws.on('message', (message) => {
    console.log('Received message:', message.toString());

    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  // Event listener for client disconnection
  ws.on('close', () => {
    console.log('A client disconnected.');
  });
});

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.post('/create', (req, res) => {
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})