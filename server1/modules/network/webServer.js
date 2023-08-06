let fs = require('fs'),
    path = require('path'),
    publicRoot = path.join(__dirname, "../../../public"),
    mimeSet = {
        "js": "application/javascript",
        "json": "application/json",
        "css": "text/css",
        "html": "text/html",
        "md": "text/markdown",
        //"png": "image/png",
    },
    http = require('http');

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

    start(server, port) {
        let _server = http.createServer(this.handleRequest.bind(this));
        _server.on('upgrade', (req, socket, head) => server.handleUpgrade(req, socket, head, ws => sockets.connect(ws, req)));
        _server.listen(port, () => console.log("Server listening on port", port));
        return _server;
    }
}

let servers = [
    {
        gameMode: c.gameModeName,
        players: 0,
        ip: c.host,
        port: c.port
    }
];

function logMiddleware(req, res, next) {
    let resStr = "";
    switch (req.url) {
        case "/lib/json/mockups.json":
            resStr = mockupJsonData;
            break;
        case "/serverData.json":
            servers.forEach((server, index) => {
                if (server.port == c.port) servers[index].players = clients.length;
            })
            resStr = JSON.stringify(servers);
            break;
        default:
            let fileToGet = path.join(publicRoot, req.url);

            //if this FILE does not exist, return the default;
            try {
                if (!fs.lstatSync(fileToGet).isFile()) {
                    throw fileToGet;
                }    
            } catch (err) {
                console.log(err);
                fileToGet = path.join(publicRoot, c.DEFAULT_FILE);
            }

            //return the file
            res.writeHead(200, { 'Content-Type': mimeSet[ fileToGet.split('.').pop() ] || 'text/html' });
            return fs.createReadStream(fileToGet).pipe(res);
    }
    res.writeHead(200);
    res.end(resStr);

    next();
}
function corsMiddleware(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    next();
}

let _temp = new App(),
    _ws = new (require('ws').WebSocketServer)({ noServer: true });
_temp.use(corsMiddleware);
_temp.use(logMiddleware);

let server = _temp.start(_ws, c.port);
module.exports = { server }