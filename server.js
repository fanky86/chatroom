const { WebSocketServer } = require('ws');

const socket = new WebSocket('wss://chatroom-viper404.vercel.app/api/ws'); // Ganti dengan port sesuai kebutuhan Anda

// Fungsi untuk broadcast pesan ke semua klien
function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

wss.on('connection', (ws) => {
    console.log('Pengguna baru terhubung.');

    // Ketika pesan diterima dari klien
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'join') {
            broadcast({ type: 'join', username: data.username });
        } else if (data.type === 'message') {
            broadcast({
                type: 'message',
                username: data.username,
                message: data.message,
            });
        }
    });

    // Kirim pesan selamat datang ke klien
    ws.send(JSON.stringify({ type: 'message', username: 'Server', message: 'Selamat datang di chatroom!' }));
});

console.log('Server WebSocket berjalan di ws://localhost:8080');
