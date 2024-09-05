const express = require('express')
const WebSocket = require('ws');
const Player = require("./classes/player.js");
const Game = require('./classes/game.js');
const app = express()
const port = 3000

// Initialize WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

const game = new Game();

// WebSocket event handling
wss.on('connection', (ws) => {
  console.log('A new client connected.');

  // Event listener for incoming messages
  ws.on('message', (e) => {
    const data = JSON.parse(e);
    switch (data.action) {
      case "registerPlayer" :
        const player = new Player(game.players.length, data.payload);
        game.addPlayer(player)
    
        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(game.players.length);
          }
        });
        break;
    }
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