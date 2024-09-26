const { default: axios } = require("axios");
const fs = require('node:fs');

class Spotify {
  authToken;
  constructor(clientId, secret) {
    this.clientId = clientId;
    this.secret = secret;
  }

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