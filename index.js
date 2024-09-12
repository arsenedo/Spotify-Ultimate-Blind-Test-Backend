const express = require("express");
const WebSocket = require("ws");
const Player = require("./classes/player.js");
const Game = require("./classes/game.js");
const app = express();
const port = 3000;

// Initialize WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Array with all games
const games = [];

// WebSocket event handling
wss.on("connection", (ws) => {

  // Event listener for incoming messages
  ws.on("message", (e) => {
    const response = {
      code : "500",
      msg : "internal server error",
      data : {}
    }
    const data = JSON.parse(e);
    const payload = data.payload;

    let game;

    const updateResponse = (code, msg, data) => {
      response.code = code;
      response.msg = msg;
      response.data = data;
    };

    switch (data.action) {
      case "registerPlayer":
        game = games.find((game) => game.code === payload.code);

        if (!game) {
          response.code = 404;
          response.msg = "game not found";
          break;
        }

        const player = new Player(game.players.length, payload.name, ws);
        
        game.addPlayer(player);

        // Broadcast the new player to everyone in the game
        for (const player of game.players) {
          // Response
          updateResponse(200, "A new player was created", { action : data.action, newPlayer : payload.name });

          player.ws.send(JSON.stringify(response));
        }
        break;
      case "registerHost":
        // TODO PARSE PAYLOAD
        const host = new Player(0, payload.name, ws);
        const code = generateCode();
        game = new Game(host, code);
        games.push(game);

        // Response
        updateResponse(200, "Created a game successfully!", { action : data.action, code });
        
        ws.send(JSON.stringify(response));

        break;
    }
  });

  	// Utils
	const generateCode = () => {
		const numbers = 5;
		let code = '';
		for (let i = 0; i < numbers; i++) {
			if (i === 0) {
				code += Math.floor(Math.random() * 9) + 1;
				continue;
			}
			code += Math.floor(Math.random() * 10);
		}
		return code;
	};
	// End utils


  // Event listener for client disconnection
  ws.on("close", () => {
    console.log("A client disconnected.");
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/create", (req, res) => {});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
