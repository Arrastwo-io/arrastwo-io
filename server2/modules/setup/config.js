const defaults = require("../../../server/config.js");

const gamemode = {
    cycle: true,
    game: [],
    mode: [],
    ROOM_SETUP: [
        [ "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm" ],
        [ "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm" ],
        [ "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm" ],
        [ "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm" ],
        [ "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm" ],
        [ "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm" ],
        [ "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm" ],
        [ "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm" ],
        [ "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm" ],
        [ "norm", "norm", "norm", "norm", "norm", "nest", "nest", "nest", "nest", "nest", "norm", "norm", "norm", "norm", "norm" ],
        [ "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm" ],
        [ "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm" ],
        [ "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm" ],
        [ "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm" ],
        [ "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm", "norm" ]
    ],
    X_GRID: 15,
    Y_GRID: 15,
};

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
        secondaryGameMode: "Boss Rush",
        MODE: "tdm",
        TEAMS: 1
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
    "2TDM": {
        MODE: "tdm",
        TEAMS: 2
    },
    "4TDM": {
        MODE: "tdm",
        TEAMS: 4
    },
    "8TDM": {
        MODE: "tdm",
        TEAMS: 8
    }
};

const names = [
    "FFA",
    "TDM",
    "2TDM",
    "4TDM",
    "8TDM"
];

defaults.port = defaults.port + Number(__dirname.split("server")[1].split("/")[0]);
defaults.host = defaults.host + ":" + defaults.port;

let outputGameMode = {};
let randomGameMode = (cycle) => {
    let output = {};
    if (!gamemode.cycle) cycle = -1;
    let index = gamemode.mode != null && cycle != (names.length - 1) ? names[cycle + 1] : names[cycle];
    output.secondaryGameMode = "";
    let modeNames = () => {
        let name = "";
        if (names[cycle] == "TDM") { name = name + games[index].TEAMS + "TDM"; }
        else if (cycle != -1) { name += names[cycle]; }
        gamemode.game.forEach((mod) => {
            name += " ";
            name += mod;
        });
        gamemode.mode.forEach((mod) => {
            name += " ";
            name += mod;
        });
        return name;
    }
    output.gameModeName = modeNames();
    for (let key in defaults) {
        output[key] = !defaults.BOTS_USE_DEFAULT && key == "BOTS" ? (output.gameModeName.includes("TDM") ? 16 : 10) : defaults[key];
        if (games[index][key] && index != -1) {
            if (key != "secondaryGameMode") { output[key] = games[index][key]; }
            else {
                output.secondaryGameMode += " ";
                output.secondaryGameMode += key;
            }
        }
        if (gamemode.game != null) gamemode.game.forEach((mod) => {
            if (games[mod][key]) {
                if (key != "secondaryGameMode") { output[key] = games[mod][key]; }
                else {
                    output.secondaryGameMode += " ";
                    output.secondaryGameMode += games[mod][key];
                }
            }
        });
        if (gamemode.mode != null) gamemode.mode.forEach((mod) => {
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
    output.cycleGame = (cycle + 1 >= names.length) ? 0 : (cycle + 1);
    output.LEVEL_SKILL_POINT_FUNCTION = level => {
        if (level < 2) return 0;
        if (level <= output.SKILL_CHEAT_CAP) return 1;
        if (level <= (output.GROWTH + 1) * 2 - output.SKILL_CHEAT_CAP && level & 1 == 1) return 1;
        return 0;
    };

    return output;
}

outputGameMode = randomGameMode(1);
module.exports = { outputGameMode, randomGameMode };