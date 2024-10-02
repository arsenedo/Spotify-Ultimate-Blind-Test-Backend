require("dotenv").config();
const express = require("express");
const WebSocket = require("ws");
const Player = require("./classes/player.js");
const Game = require("./classes/game.js");
const Spotify = require("./classes/spotify.js");
const app = express();
const port = 3000;

// Initialize WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Array with all games
const games = [];

const spotify = new Spotify(process.env.CLIENT_ID, process.env.SECRET);
spotify.getNewAuthToken();

// WebSocket event handling
wss.on("connection", (ws) => {
  // Event listener for incoming messages
  ws.on("message", async (e) => {
    const response = {
      code: "500",
      msg: "internal server error",
      data: {},
    };
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
          const playerNames = game.players.map((item) => item.name);
          // Response
          updateResponse(200, "A new player was created", {
            action: data.action,
            players: playerNames,
            code: payload.code,
          });

          player.ws.send(JSON.stringify(response));
        }
        break;
      case "registerHost":
        // TODO PARSE PAYLOAD
        const host = new Player(0, payload.name, ws);
        const code = generateCode();
        game = new Game(host, code, spotify);
        games.push(game);

        // Response
        updateResponse(200, "Created a game successfully!", {
          action: data.action,
          code,
        });

        ws.send(JSON.stringify(response));

        break;
      case "startGame":
        game = games.find((game) => game.code === payload.code);
        if (!game) {
          updateResponse(404, "Game not found", {});
          ws.send(JSON.stringify(response));
          return;
        }

        if (game.players.length < 2) {
          updateResponse(403, "Not enough players to start the game", {});
          ws.send(JSON.stringify(response));
          return;
        }

        game.startGame();

        updateResponse(200, "Game has started!", {
          action: data.action,
          isStarted: true,
        });
        for (const player of game.players) {
          player.ws.send(JSON.stringify(response));
        }
        break;
      case "playerReady":
        game = games.find((game) => game.code === payload.code);

        if (!game) {
          updateResponse(404, "Game not found", {
            action: "error",
            code: payload.code,
          });
          ws.send(JSON.stringify(response));
          return;
        }

        if (game.setReady(payload.name)) {
          updateResponse(200, "Player ready!", {
            action: data.action,
            name: payload.name,
          });
          ws.send(JSON.stringify(response));

          // Check if all players ready
          if (game.arePlayersReady()) {
            updateResponse(200, "All players are ready!", {
              action: "allReady",
            });
            for (const player of game.players) {
              player.ws.send(JSON.stringify(response));
            }
          }
          return;
        }

        updateResponse(404, "Couldn't update the players ready state!", {
          action: "error",
          name: payload.name,
        });
        ws.send(JSON.stringify(response));
        break;

      case "appendAlbums":
        game = findGame(payload.code);
        const existingAlbums = game.pushAlbums(payload.albums);
        existingAlbums.length === 0
          ? updateResponse(200, "All albums added!", { action: data.action })
          : updateResponse(
            207,
            `${existingAlbums.length} albums were not added`,
            { action: data.action, existingAlbums }
          );
        ws.send(JSON.stringify(response));
        break;

      // Async handlers
      case "playerLoaded":
        game = findGame(payload.code);

        if (!game) {
          updateResponse(404, "Game not found", {
            action: "error",
            code: payload.code,
          });
          ws.send(JSON.stringify(response));
          return;
        }

        if (game.setLoaded(payload.name)) {
          updateResponse(200, "Player loaded successfuly!", { action: data.action });
          ws.send(JSON.stringify(response));

          // Check if all players loaded
          if (game.arePlayersLoaded()) {
            game.allLoaded = true;

            const song = await game.getRandomSongFromRandomAlbum();
            console.log(song)
            // Broadcast the song to everyone in the game
            for (const player of game.players) {
              // Response
              updateResponse(200, "Song found!", {
                action: "songReceive",
                song,
              });

              player.ws.send(JSON.stringify(response));
            }
          }

          return
        }

        updateResponse(404, "Couldn't update the players loaded state!", {
          action: "error",
          name: payload.name,
        });
        ws.send(JSON.stringify(response));
        break;
    }
  });

  // Utils
  const generateCode = () => {
    const numbers = 5;
    let code = "";
    for (let i = 0; i < numbers; i++) {
      if (i === 0) {
        code += Math.floor(Math.random() * 9) + 1;
        continue;
      }
      code += Math.floor(Math.random() * 10);
    }
    return code;
  };

  const findGame = (code) => {
    return games.find((game) => game.code === code);
  }
  // End utils

  // Event listener for client disconnection
  ws.on("close", () => {
    console.log("A client disconnected.");
  });
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
