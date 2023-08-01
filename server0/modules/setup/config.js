const defaults = require("../../../server/config.js");

const gamemode = {
    game: [
        "TDM"
    ],
    mode: [
        "Domination"
    ],
    ROOM_SETUP: [
        [ "norm", "norm", "norm", "norm", "norm", "norm", "roid", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm" ],
        [ "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm" ],
        [ "norm", "norm", "rock", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "rock", "norm", "norm" ],
        [ "wall", "wall", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "wall", "wall" ],
        [ "norm", "dom0", "norm", "norm", "norm", "nest", "nest", "nest", "nest", "nest", "norm", "norm", "norm", "dom0", "norm" ],
        [ "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm" ],
        [ "norm", "norm", "norm", "norm", "nest", "nest", "nest", "nest", "nest", "nest", "nest", "norm", "norm", "norm", "norm" ],
        [ "norm", "norm", "norm", "norm", "nest", "nest", "nest", "nest", "nest", "nest", "nest", "norm", "norm", "norm", "norm" ],
        [ "norm", "norm", "norm", "norm", "nest", "nest", "nest", "nest", "nest", "nest", "nest", "norm", "norm", "norm", "norm" ],
        [ "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm" ],
        [ "norm", "dom0", "norm", "norm", "norm", "nest", "nest", "nest", "nest", "nest", "norm", "norm", "norm", "dom0", "norm" ],
        [ "wall", "wall", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "wall", "wall" ],
        [ "norm", "norm", "rock", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "rock", "norm", "norm" ],
        [ "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm" ],
        [ "norm", "norm", "norm", "norm", "norm", "norm", "roid", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm" ]
    ],
    X_GRID: 15,
    Y_GRID: 15,
}

const modes = {
    "Manhunt": {
        secondaryGameMode: "Manhunt"
    },
    "TrainWars": {
        TRAIN: true,
        secondaryGameMode: "TrainWars"
    },
    "Assault": {
        secondaryGameMode: "Assault",
    },
    "Soccer": {
        SOCCER: true,
        secondaryGameMode: "Soccer",
    },
    "Shiny": {
        SHINY: true,
    },
    "Growth": {
        GROWTH: 90,
        secondaryGameMode: "Growth",
        SKILL_CAP: 400,
    },
    "Space": {
        ARENA_TYPE: "circle",
        SPACE_MODE: true,
        secondaryGameMode: "Space"
    },
    "Siege": {
        SPECIAL_BOSS_SPAWNS: true,
        secondaryGameMode: "Boss Rush"
    },
    "Mothership": {
        MOTHERSHIP_LOOP: true,
        secondaryGameMode: "Mothership"
    },
    "Tag": {
        TAG: true,
        secondaryGameMode: "Tag"
    },
    "Domination": {
        DOMINATOR_LOOP: true,
        secondaryGameMode: "Domination"
    }
};

const games = {
    "FFA": {
        BOTS: 9
    }, // "defaults" is already FFA.
    "TDM": {
        MODE: "tdm",
        TEAMS: 2 + (Math.random() * 3 | 0)
    },
    "Groups": {
        GROUPS: 2 + (Math.random() * 3 | 0),
        secondaryGameMode: "Squads"
    },
    "Maze": {
        MAZE: 30,
        secondaryGameMode: "Maze"
    },
    "1TDM": {
        MODE: "tdm",
        TEAMS: 1,
    },
    "2TDM": {
        MODE: "tdm",
        TEAMS: 2,
    },
    "4TDM": {
        MODE: "tdm",
        TEAMS: 4,
    },
    "8TDM": {
        MODE: "tdm",
        TEAMS: 8,
    }
};

defaults.port = defaults.port + Number(__dirname.split("server")[1].split("/")[0]);
if (defaults.host == "localhost") defaults.host = "localhost:" + defaults.port;

let output = {};
output.secondaryGameMode = "";
let modeNames = () => {
    let name = "";
    gamemode.game.forEach((mod, index) => {
        if (mod = "TDM" && output.TEAMS != 1) { name = name + output.TEAMS + " " + mod; }
        else { name += mod; }
        if (index != (gamemode.game.length - 1)) name += " ";
    });
    return name;
}
for (let key in defaults) {
    output[key] = !defaults.BOTS_USE_DEFAULT && key == "BOTS" ? (output.gameModeName.includes("TDM") ? 16 : 10) : defaults[key];
    gamemode.game.forEach((gam) => {
        if (games[gam][key]) {
            if (key != "secondaryGameMode") { output[key] = games[gam][key]; }
            else {
                output.secondaryGameMode += " ";
                output.secondaryGameMode += games[gam][key]
            }
        }
    });
    gamemode.mode.forEach((mod) => {
        if (modes[mod][key]) {
            if (key != "secondaryGameMode") { output[key] = modes[mod][key]; }
            else {
                output.secondaryGameMode += " ";
                output.secondaryGameMode += modes[mod][key];
            }
        }
    });
}

output.X_GRID = gamemode.X_GRID;
output.Y_GRID = gamemode.Y_GRID;
output.WIDTH = output.X_GRID * 400;
output.HEIGHT = output.Y_GRID * 400;
output.ROOM_SETUP = gamemode.ROOM_SETUP;
output.gameModeName = modeNames();

module.exports = { output };