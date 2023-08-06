const bossRush = new BossRush()
const ballLoop = new BallLoop()

const modesInit = function () {
    for (let team = 1; team < c.TEAMS + 1; team++) {
        room["bap" + team].forEach((loc) => {
            let o = new Entity(loc);
            o.define(Class.baseProtector);
            o.team = -team;
            o.color = [10, 11, 12, 15, 25, 26, 27, 28][team - 1];
        });
    }
    if (c.SPACE_MODE) {
        console.log("Spawned moon.");
        let o = new Entity({
            x: room.width / 2,
            y: room.height / 2,
        });
        o.define(Class.moon);
        o.define({
            BODY: {
                ACCELERATION: 0.015 / (Class.moon.FOOD.LEVEL + 1),
            },
        });
        o.team = -102;
        o.SIZE = room.width / 10;
        room.blackHoles.push(o);
    }
    if (c.SPECIAL_BOSS_SPAWNS) {
        bossRush.init();
        bossRush.reset();
    }
    if (c.MAZE && typeof c.MAZE == "number") generateMaze(c.MAZE);
    if (c.MOTHERSHIP_LOOP) mothershipLoop.spawn();
    if (c.SOCCER) ballLoop.spawn();
    if (c.DOMINATOR_LOOP) dominatorLoop.reset();
    if (c.TAG) tagReset();
}

modesInit();
if (c.DOMINATOR_LOOP)
    for (let loc of room.dom0) dominatorLoop.spawn(loc, c.gameModeName.includes("Assault") ? -c.TEAMS : -100, 3);

let logger = new LagLogger();
const gamemodeLoop = function() {
    logger.set();
    if (c.MOTHERSHIP_LOOP) mothershipLoop.loop();
    if (c.DOMINATOR_LOOP) dominatorLoop.tally();
    if (c.SPECIAL_BOSS_SPAWNS) bossRush.loop();
    if (c.SOCCER) ballLoop.loop();
    if (c.secondaryGameMode.includes("Manhunt")) {
        loopThrough(entities.filter(r => r.isPlayer || r.isBot), function (instance) {
            if (hunters.length < 1 && instance.team == -1) {
                instance.team = -c.TEAMS;
                instance.color = [10, 11, 12, 15, 25, 26, 27, 28][-instance.team - 1];
                instance.skill.realSkillCap *= 2;
                instance.skill.reset();
                instance.setLevel(instance.skill.realSkillCap);
                hunters[0] = instance;
            }
        });
    }
    logger.mark();
    if (logger.totalTime > 100) {
        console.log("Gamemode loop is taking a long time!");
        console.log(`Gamemode loop took ${logger.totalTime}ms to complete!`);
        console.log(`Gamemode loop log history: (Last ${logger.sum.length} entries)`);
        console.log(logger.sum.map(entry => `Run at: ${entry.at}. Time: ${entry.time}.`).join("\n"));
    }
};

module.exports = { gamemodeLoop, modesInit };