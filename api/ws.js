const WebSocket = require('ws');

export default function handler(req, res) {
    if (req.headers['upgrade'] !== 'websocket') {
        res.status(400).send('Upgrade ke WebSocket diperlukan');
        return;
    }

    const wss = new WebSocket.Server({ noServer: true });

    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
        ws.on('message', (message) => {
            console.log('Pesan diterima: ', message);
            // Broadcast pesan ke semua klien
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        });

        // Pesan dari server
        ws.send('Selamat datang di chatroom!');
    });

    req.socket.on('upgrade', (req, socket, head) => {
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req);
        });
    });
}
