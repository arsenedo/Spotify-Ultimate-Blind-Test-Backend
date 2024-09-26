class Player {
    id;
    score = 0;
    ready = false;
    constructor(id, name, ws) {
        this.id = id;
        this.name= name;
        this.ws = ws;
    }
}

module.exports = Player;