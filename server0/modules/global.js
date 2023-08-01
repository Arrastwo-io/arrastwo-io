// Global Utilities Requires
let EventEmitter = require('events');
global.events = new EventEmitter();
global.c = require("./setup/config.js").output;
global.c.port = process.env.PORT || c.port;
global.ran = require("../../server/lib/random.js");
global.util = require("../../server/lib/util.js");
global.hshg = require("../../server/lib/hshg.js");
global.protocol = require("../../server/lib/fasttalk.js");

// Global Variables (These must come before we import from the modules folder.)
global.roomSpeed = c.gameSpeed;
global.fps = "Unknown";
global.minimap = [];
global.entities = [];
global.views = [];
global.hunters = [];
global.entitiesToAvoid = [];
global.grid = new hshg.HSHG();
global.arenaClosed = false;
global.mockupsLoaded = false;
global.nextTagBotTeam = null;
global.disconnections = [];
global.getTeam = function getTeam(type = 0) { // 0 - Bots only, 1 - Players only, 2 - all
    const teamData = {};
    for (let i = 0; i < (c.TEAMS - (c.secondaryGameMode.includes("Manhunt") ? 1 : 0)); i++) teamData[i + 1] = 0;
    if (type !== 1) {
        for (const o of entities) {
            if (o.isBot && -o.team > 0 && -o.team <= (c.TEAMS - (c.secondaryGameMode.includes("Manhunt") ? 1 : 0))) {
                teamData[-o.team]++;
            }
        }
    }
    if (type !== 0) {
        for (let { socket } of sockets.players) {
            if (socket.rememberedTeam > 0 && socket.rememberedTeam <= (c.TEAMS - (c.secondaryGameMode.includes("Manhunt") ? 1 : 0))) {
                teamData[socket.rememberedTeam]++;
            }
        }
    }
    const toSort = Object.entries(teamData).filter(entry => !global.defeatedTeams.includes(-entry[0])).sort((a, b) => a[1] - b[1]);
    return toSort.length === 0 ? ((Math.random() * (c.TEAMS - (c.secondaryGameMode.includes("Manhunt") ? 1 : 0)) | 0) + 1) : toSort[0][0];
}

global.loopThrough = function(array, callback = () => {}) {
    for (let index = 0, length = array.length; index < length; index++) callback(array[index], index);
};

global.dirtyCheck = function (p, r) {
    for (let i = 0; i < entitiesToAvoid.length; i++) {
        let e = entitiesToAvoid[i];
        if (Math.abs(p.x - e.x) < r + e.size && Math.abs(p.y - e.y) < r + e.size) return true;
    }
    return false
};

global.isEven = function isEven(number) {
    let string = number.toString();
    let last = string[string.length - 1];
    return [0, 2, 4, 6, 8].includes(Number(last));
};

global.rotatePoint = function rotatePoint({
    x,
    y
}, angle) {
    const dist = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    const rad = Math.atan2(y, x) + angle;
    return {
        x: Math.cos(rad) * dist,
        y: Math.sin(rad) * dist,
    };
};

// Now that we've set up the global variables, we import all the modules, then put them into global varialbles and then export something just so this file is run.
const requires = [
    "../../server/modules/setup/room.js", // These are the basic room functions, set up by config.json
    "../../server/modules/physics/relative.js", // Some basic physics functions that are used across the game.
    "../../server/modules/live/entitySubFunctions.js", // Skill, HealthType and other functions related to entities are here.
    "../../server/modules/network/sockets.js", // The networking that helps players interact with the game.
    "./network/webServer.js", // The networking that actually hosts the server.
    "../../server/modules/live/controllers.js", // The AI of the game.
    "../../server/modules/live/entity.js", // The actual Entity constructor.
    "../../server/modules/physics/collisionFunctions.js", // The actual collision functions that make the game work.
    "../../server/modules/debug/logs.js", // The logging pattern for the game. Useful for pinpointing lag.
    "../../server/modules/debug/speedLoop.js", // The speed check loop lmao.
    "../../server/modules/gamemodes/bossRush.js", // Boss Rush
    "../../server/modules/gamemodes/maze.js", // Maze
    "../../server/modules/gamemodes/mothership.js", // The mothership mode
    "../../server/modules/gamemodes/domination.js", // The Domination mode
    "../../server/modules/gamemodes/soccer.js", // The Soccer mode
    "../../server/modules/gamemodes/groups.js", // Duos/Trios/Squads
    "../../server/modules/gamemodes/tag.js", // Tag
    "../../server/modules/gamemodes/gamemodeLoop.js", // The gamemode loop.
    "../../server/modules/gamemodes/closeArena.js", // Arena Closing mechanics
    "../../server/modules/setup/mockups.js", // This file loads the mockups.
    "../../server/modules/debug/antibot.js" // Antibot :DDD
];

for (let file of requires) {
    const module = require(file);
    if (module.init) module.init(global);
    for (let key in module) {
        if (module.hasOwnProperty(key)) global[key] = module[key];
    }
}

module.exports = {
    creationDate: new Date(),
    creationTime: new Date().getTime()
};