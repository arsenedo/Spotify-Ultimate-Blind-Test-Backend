const { default: axios } = require("axios");
const fs = require('node:fs');

class Spotify {
  authToken;
  constructor(clientId, secret) {
    this.clientId = clientId;
    this.secret = secret;
  }

  // API calls
  async getNewAuthToken() {
    await axios
      .post(
        "https://accounts.spotify.com/api/token",
        {
          grant_type: "client_credentials",
          client_id: this.clientId,
          client_secret: this.secret,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((resp) => this.authToken = resp.data)
      .catch((e) => {
        console.log("Couldnt authentify...");
        return Promise.reject(e);
      });

    this.saveToken(JSON.stringify(this.authToken));
  }

  async getRandomSongFromAlbum(id) {
    const items = await axios.get(`https://api.spotify.com/v1/albums/${id}/tracks`, {
      headers: {
        Authorization: `${this.authToken.token_type} ${this.authToken.access_token}`
      }
    }).then(resp => resp.data.items);

    const song = items[Math.floor(Math.random() * items.length)];

    const track = await axios.get(`https://api.spotify.com/v1/tracks/${song.id}`, {
      headers: {
        Authorization: `${this.authToken.token_type} ${this.authToken.access_token}`
      }
    }).then(resp => resp.data);

    return track;
  }

  saveToken(authToken) {
    if (!authToken) return
    fs.writeFile('authToken.json', authToken, err => {
      if (err) {
        console.error(err);
      } else {
        console.log("Auth token saved successfully!");
        return
      }
    });
  }
}

module.exports = Spotify;