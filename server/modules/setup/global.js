// Global Utilities Requires
let EventEmitter = require('events');
global.events = new EventEmitter();
global.ran = require("../../lib/random.js");
global.util = require("../../lib/util.js");
global.hshg = require("../../lib/hshg.js");
global.protocol = require("../../lib/fasttalk.js");
let fetch;
global.fetch = null;
(async () => {
    fetch = await import('node-fetch');
    global.fetch = fetch.default;
})();

// Global Variables (These must come before we import from the modules folder.)
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