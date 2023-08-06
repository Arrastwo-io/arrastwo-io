// Global Utilities Requires
require("../../server/modules/setup/global");
global.c = require("./setup/config.js").outputGameMode;
global.randomGameMode = require("./setup/config.js").randomGameMode;
global.roomSpeed = c.gameSpeed;

// Now that we've set up the global variables, we import all the modules, then put them into global varialbles and then export something just so this file is run.
const requires = [
    "../../server/modules/setup/room.js", // These are the basic room functions, set up by config.json
    "../../server/modules/physics/relative.js", // Some basic physics functions that are used across the game.
    "../../server/modules/physics/collisionFunctions.js", // The actual collision functions that make the game work.
    "../../server/modules/live/entitySubFunctions.js", // Skill, HealthType and other functions related to entities are here.
    "../../server/modules/live/controllers.js", // The AI of the game.
    "../../server/modules/live/entity.js", // The actual Entity constructor.
    "../../server/modules/network/sockets.js", // The networking that helps players interact with the game.
    "./network/webServer.js", // The networking that actually hosts the server.
    "../../server/modules/debug/logs.js", // The logging pattern for the game. Useful for pinpointing lag.
    "../../server/modules/debug/speedLoop.js", // The speed check loop lmao.
    "../../server/modules/gamemodes/bossRush.js", // Boss Rush
    "../../server/modules/gamemodes/maze.js", // Maze
    "../../server/modules/gamemodes/mothership.js", // The mothership mode
    "../../server/modules/gamemodes/domination.js", // The Domination mode
    "../../server/modules/gamemodes/soccer.js", // The Soccer mode
    "../../server/modules/gamemodes/groups.js", // Duos/Trios/Squads
    "../../server/modules/gamemodes/tag.js", // Tag
    "../../server/modules/gamemodes/closeArena.js", // Arena Closing mechanics
    "../../server/modules/gamemodes/gamemodeLoop.js", // The gamemode loop.
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