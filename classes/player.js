class Player {
    id;
    score;
    constructor(id, name, ws) {
        this.id = id;
        this.name= name;
        this.ws = ws;
    }
}

module.exports = Player;