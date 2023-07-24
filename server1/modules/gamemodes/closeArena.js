let loop;
function close() {
    util.log("[INFO] Arena closed!");
    sockets.broadcast("Closing!");
    clearInterval(loop);
    setTimeout(() => {
        loopThrough(entities, function (instance) {
            if (
                instance.isPlayer ||
                instance.team == -102 ||
                instance.team == -100 ||
                (instance.team == c.TEAMS && c.gameModeName.includes("Assault"))
            ) instance.destroy();
        });
        global.arenaClosed = false;
        c.gameModeName = c.gameModeName.split(" - ")[0];
        basepro();
        modesInit();
        util.log("[INFO] Arena opened!");
    }, 10000);
}

function closeArena() {
    if (arenaClosed) return;
    sockets.broadcast("Arena closed: No players may join!");
    util.log("[WARNING] Arena closing!");
    c.gameModeName = `${c.gameModeName} - Closed`;
    global.arenaClosed = true;
    setTimeout(() => {
        for (let i = 0; i < 15; i++) {
            let angle = ((Math.PI * 2) / 15) * i;
            let o = new Entity({
                x: room.width / 2 + (room.width / 1.5) * Math.cos(angle),
                y: room.width / 2 + (room.width / 1.5) * Math.sin(angle),
            });
            o.define(Class.arenaCloser);
            o.define({
                AI: {
                    FULL_VIEW: true,
                    SKYNET: true,
                    BLIND: true,
                    LIKES_SHAPES: true,
                },
                CONTROLLERS: ["nearestDifferentMaster", "mapTargetToGoal"],
                SKILL: Array(10).fill(9),
                ACCEPTS_SCORE: false,
                CAN_BE_ON_LEADERBOARD: false,
                VALUE: 100000,
            });
            o.color = 3;
            o.team = -100;
            o.isArenaCloser = true;
            o.name = "Arena Closer";
        }
        let ticks = 0;
        loopThrough(entities, function (instance) {
            if (
                (instance.team == -100 ||
                (instance.team == c.TEAMS && c.gameModeName.includes("Assault"))) &&
                instance.label.includes("Dreadnought")
            ) instance.destroy();
        });
        loop = setInterval(function checkSurvivors() {
            ticks++;
            if (ticks >= 200) return close();
            let alive = false;
            loopThrough(entities, function (instance) {
                if (
                    (instance.isPlayer && instance.label != "Spectator") ||
                    instance.isBot ||
                    instance.isMothership
                ) alive = true;
            });
            if (!alive) close();
        }, 500);
    }, 10000);
}

module.exports = { closeArena };