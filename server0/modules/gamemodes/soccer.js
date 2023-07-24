class BallLoop {
    constructor(){
        this.score = [];
        for (let i = 1; i <= c.TEAMS; i++) {
            this.score[i] = 0;
        }
        this.o = null;
        this.win = 5;
        this.gameActive = true;
    }

    spawn() {
        console.log("Spawned ball.");
        this.o = new Entity({
            x: room.width / 2,
            y: room.height / 2,
        });
        this.o.define(Class.ball);
        this.o.controllers = [];
        this.o.team = -102;
        this.gameActive = true;
    }

    playerWin(i) {
        if (this.gameActive) {
            this.gameActive = false;
            sockets.broadcast(["BLUE", "GREEN", "RED", "PURPLE", "YELLOW", "ORANGE", "BROWN", "CYAN"][i - 1] + ' has won the game!');
            setTimeout(closeArena, 1500);
        }
    }

    loop() {
        for (let i = 1; i <= c.TEAMS; i++) {
            if (room.isIn("bas" + i, this.o)) {
                this.score[i] = this.score[i] + 1;
                if (this.score[i] < this.win) {
                    this.o.destroy();
                    this.spawn();
                    sockets.broadcast(["BLUE", "GREEN", "RED", "PURPLE", "YELLOW", "ORANGE", "BROWN", "CYAN"][i - 1] + ' won the goal!');
                } else { this.playerWin(i); }
            }
        }
    }
}

module.exports = { BallLoop };
