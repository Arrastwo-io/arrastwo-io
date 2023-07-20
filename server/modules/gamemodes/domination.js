let config = {
    types: [Class.destroyerDominator, Class.gunnerDominator, Class.trapperDominator],
    neededToWin: 4
};
let gameWon;
let timer;
let spawn = (loc, team, color, type = false) => {
    type = type ? type : ran.choose(config.types);
    let o = new Entity(loc);
    o.define(type);
    o.team = team;
    o.color = [10, 11, 12, 15, 25, 26, 27, 28][-team - 1] || 3;
    o.skill.score = 111069;
    o.name = "Dominator";
    o.SIZE = c.WIDTH / c.X_GRID / 10;
    o.isDominator = true;
    o.controllers = [new ioTypes.nearestDifferentMaster(o), new ioTypes.spin(o, { onlyWhenIdle: true })];
    if (team != -100) room.setType("dom" + -team, loc);
    o.on('dead', () => {
        if (o.team === c.gameModeName.includes("Assault") ? -c.TEAMS : -100) {
            let killers = [];
            for (let instance of o.collisionArray) {
                if (instance.team > -(c.TEAMS + 1) && instance.team < 0 && o.team !== instance.team) {
                    killers.push(instance);
                }
            }
            let newTeam;
            killers.length < 1 ? newTeam = c.gameModeName.includes("Assault") ? -c.TEAMS : -100 : newTeam = ran.choose(killers).team;
            spawn(loc, newTeam, 3, type);
            sockets.broadcast("A dominator is now controlled by " + ["BLUE", "GREEN", "RED", "PURPLE", "YELLOW", "ORANGE", "BROWN", "CYAN"][-newTeam - 1] + "!");
            room.setType("dom" + (newTeam == -100 ? 0 : -newTeam), loc);
            for (let player of sockets.players) {
                if (player.body) {
                    if (player.body.team === newTeam) {
                        player.body.sendMessage("Press G to take control of the dominator.");
                    }
                }
            }
        } else {
            spawn(loc, c.gameModeName.includes("Assault") ? -c.TEAMS : -100, 3, type);
            room.setType("dom" + c.gameModeName.includes("Assault") ? c.TEAMS : 0, loc);
            sockets.broadcast("A dominator is being contested!");
        }
    });
};

function winner(teamId) {
    let ret = false;
    if (c.gameModeName.includes("Assault") && teamId + 1 == c.TEAMS) timer < 0 ? null : ret = true;
    if (ret) return;
    gameWon = true;
    setTimeout(function() {
        let team = ["BLUE", "GREEN", "RED", "PURPLE"][teamId] || "An unknown team";
        sockets.broadcast(team + " has won the game!");
        setTimeout(closeArena, 3000);
    }, 1500);
};

function reset() {
    gameWon = false;
    timer = 20 * room.cycleSpeed;
};

function tally() {
    if (gameWon == true) return;
    timer -= 1;
    let dominators = {};
    for (let i = 0; i < c.TEAMS; i++) dominators[-(i + 1)] = 0;
    loopThrough(entities, function(o) {
        if (o.isDominator && dominators[o.team] != null) dominators[o.team]++;
    });
    if (dominators["-1"] === config.neededToWin) winner(0);
    if (dominators["-2"] === config.neededToWin) winner(1);
    if (dominators["-3"] === config.neededToWin) winner(2);
    if (dominators["-4"] === config.neededToWin) winner(3);
};
const dominatorLoop = { spawn, tally, reset };

module.exports = { dominatorLoop };
