class Game {
  players = [];
  albums = [];
  isStarted = false;

  constructor(host, code) {
    this.code = code;
    this.host = host;

    this.addPlayer(this.host);
  }

  /**
   * Adds a player to the game
   * @param {Player} player
   * @returns the length of the array of players or false if the game has already started
   */
  addPlayer(player) {
    if (!this.isStarted) {
      this.players.push(player);
      return player.length;
    }
    return false;
  }

  arePlayersReady() {
    return this.players.filter((player) => !player.ready).length === 0;
  }

  setReady(playerName) {
    const player = this.players.find(
      (player) => player.name.toLowerCase() === playerName.toLowerCase()
    );
    if (player) {
      player.ready = true;
      return true;
    }
    return false;
  }

  startGame() {
    this.isStarted = true;
  }

  pushAlbums(newAlbums) {
    for (const album of newAlbums) {
      if (!this.albums.includes(album)) this.albums.push(album);
    }
  }
}

module.exports = Game;
