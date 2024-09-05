class Game {
    players = [];
    isStarted = false;

    /**
     * Adds a player to the game
     * @param {Player} player 
     * @returns the length of the array of players or false if the game has already started
     */
    addPlayer(player) {
        if(!this.isStarted) {
            this.players.push(player);
            return player.length
        }
        return false;
    }

    startGame() {
        this.isStarted = true;
    }
}

module.exports = Game;