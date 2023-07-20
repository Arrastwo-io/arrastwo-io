let fs = require('fs'),
    path = require('path'),
    cmd = require('node-cmd'),
    crypto = require('crypto'),
    bodyParser = require('body-parser'),
    publicRoot = path.join(__dirname, "../../../public"),
    mimeSet = {
        "js": "application/javascript",
        "json": "application/json",
        "css": "text/css",
        "html": "text/html",
        "md": "text/markdown",
        //"png": "image/png",
    },
wsServer = new (require('ws').WebSocketServer)({ noServer: true });
server = require('http').createServer((req, res) => {
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
});

server.use(bodyParser.json())
const verifySignature = (req, res, next) => {
    const payload = JSON.stringify(req.body)
    const hmac = crypto.createHmac('sha1', process.env.GITHUB_SECRET)
    const digest = 'sha1=' + hmac.update(payload).digest('hex')
    const checksum = req.headers['x-hub-signature']

    if (!checksum || !digest || checksum !== digest) {
        return res.status(403).send('auth failed')
    }

    return next()
}

// Github webhook listener
server.post('/git', verifySignature, (req, res) => {
    if (req.headers['x-github-event'] == 'push') {
        cmd.get('bash git.sh', (err, data) => {
        if (err) return console.log(err)
        console.log(data)
        return res.status(200).send(data)
        })
    } else if (req.headers['x-github-event'] == 'ping') {
        return res.status(200).send('PONG')
    } else {
        return res.status(200).send('Unsuported Github event. Nothing done.')
    }
})

server.on('upgrade', (req, socket, head) => wsServer.handleUpgrade(req, socket, head, ws => sockets.connect(ws, req)));
server.listen(c.port, () => console.log("Server listening on port", c.port));
module.exports = { server };