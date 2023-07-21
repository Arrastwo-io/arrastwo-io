let fs = require('fs'),
    path = require('path'),
    cmd = require('node-cmd'),
    crypto = require('crypto'),
    publicRoot = path.join(__dirname, "../../../public"),
    mimeSet = {
        "js": "application/javascript",
        "json": "application/json",
        "css": "text/css",
        "html": "text/html",
        "md": "text/markdown",
        //"png": "image/png",
    },
    http = require('http'),
    wsServer = new (require('ws').WebSocketServer)({ noServer: true });

class App {
    constructor() {
        this.middlewareStack = [];
    }
    
    use(middleware) {
        this.middlewareStack.push(middleware);
    }
    
    handleRequest(req, res) {
        let index = 0;
    
        const next = () => {
            if (index < this.middlewareStack.length) {
                const middleware = this.middlewareStack[index++];
                middleware(req, res, next);
            }
        };
    
        next();
    }
    
    start(port) {
        const server = http.createServer(this.handleRequest.bind(this));
        server.on('upgrade', (req, socket, head) => wsServer.handleUpgrade(req, socket, head, ws => sockets.connect(ws, req)));
        server.listen(port, () => console.log("Server listening on port", port));
        return server;
    }
}

const app = new App();

function logMiddleware(req, res, next) {
    let resStr = "";
    switch (req.url) {
        case "/lib/json/mockups.json":
            resStr = mockupJsonData;
            break;
        case "/lib/json/gamemodeData.json":
            resStr = JSON.stringify({
                gameMode: c.gameModeName,
                players: views.length,
                code: [c.MODE, c.MODE === "ffa" ? "f" : c.TEAMS, c.secondaryGameMode].join("-"),
                ip: c.host
            });
            break;
        case "/serverData.json":
            resStr = JSON.stringify({ ok: true, ip: c.host });
            break;
        default:
            let fileToGet = path.join(publicRoot, req.url);

            //if this FILE does not exist, return the default;
            if (!fs.lstatSync(fileToGet).isFile()) {
                fileToGet = path.join(publicRoot, c.DEFAULT_FILE);
            }

            //return the file
            res.writeHead(200, { 'Content-Type': mimeSet[ fileToGet.split('.').pop() ] || 'text/html' });
            return fs.createReadStream(fileToGet).pipe(res);
    }
    res.writeHead(200);
    res.end(resStr);
}
app.use(logMiddleware);

let server = app.start(c.port);
module.exports = { server };
