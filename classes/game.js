class Game {
  players = [];
  albums = [];
  isStarted = false; // Counts as started when the host starts the data pick sequence
  allLoaded = false;
  allSongReceived = false;

  constructor(host, code, spotifyController) {
    this.code = code;
    this.host = host;
    this.spotifyController = spotifyController;

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

  arePlayersLoaded() {
    return this.players.filter((player) => !player.loaded).length === 0;
  }

  setReady(playerName) {
    const player = this.getPlayer(playerName)
    if (player) {
      player.ready = true;
      return true;
    }
    return false;
  }

  setLoaded(playerName) {
    const player = this.getPlayer(playerName);
    if (player) {
      player.loaded = true;
      return true;
    }
    return false;
  }

  startGame() {
    this.isStarted = true;
  }

  // Albums
  pushAlbums(newAlbums) {
    const existingAlbums = [];
    for (const newAlbum of newAlbums) {
      if (!this.albums.some((album) => album.id === newAlbum.id)) {
        this.albums.push(newAlbum);
        continue;
      }
      existingAlbums.push(newAlbum);
    }
    return existingAlbums;
  }

  getRandomAlbum() {
    return this.albums[Math.floor(Math.random()*this.albums.length)]
  }

  async getRandomSongFromRandomAlbum() {
    const album = this.getRandomAlbum();

    const song = await this.spotifyController.getRandomSongFromAlbum(album.id);
    
    return song;
  }

  getPlayer(name) {
    const player = this.players.find(
      (player) => player.name.toLowerCase() === name.toLowerCase()
    );
    return player;
  }
}

module.exports = Game;
