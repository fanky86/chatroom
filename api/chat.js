const WebSocket = require('ws');

let wss;
const badWords = ['kata1', 'kata2', 'kata3', 'kata4'];  // Daftar kata kotor

// Fungsi untuk menyensor pesan
function censorMessage(message) {
    let censoredMessage = message;
    badWords.forEach((badWord) => {
        const regex = new RegExp(badWord, 'gi'); // Case-insensitive
        censoredMessage = censoredMessage.replace(regex, '*'.repeat(badWord.length));
    });
    return censoredMessage;
}

module.exports = (req, res) => {
  if (!wss) {
    wss = new WebSocket.Server({ noServer: true });

    wss.on('connection', (ws) => {
      ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'join') {
          // Memberitahukan klien lain bahwa pengguna baru bergabung
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'join', username: data.username }));
            }
          });
        } else if (data.type === 'message') {
          // Menyensor pesan sebelum mengirim
          const censoredMessage = censorMessage(data.message);
          // Mengirim pesan yang sudah disensor ke semua klien
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'message', username: data.username, message: censoredMessage }));
            }
          });
        }
      });
    });
  }

  res.socket.server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  res.status(200).send('WebSocket server running');
};
