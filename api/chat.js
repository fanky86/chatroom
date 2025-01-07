const WebSocket = require('ws');
const fs = require('fs');

let wss;
const badWords = ['bokep', 'anjing', 'kontol', 'tolol']; // Daftar kata kotor
const messagesFile = './messages.json'; // Lokasi penyimpanan pesan

// Fungsi untuk menyensor pesan
function censorMessage(message) {
    let censoredMessage = message;
    badWords.forEach((badWord) => {
        const regex = new RegExp(badWord, 'gi'); // Case-insensitive
        censoredMessage = censoredMessage.replace(regex, '*'.repeat(badWord.length));
    });
    return censoredMessage;
}

// Fungsi untuk membaca pesan dari file
function loadMessages() {
    if (fs.existsSync(messagesFile)) {
        const data = fs.readFileSync(messagesFile);
        return JSON.parse(data);
    }
    return [];
}

// Fungsi untuk menyimpan pesan ke file
function saveMessages(messages) {
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
}

// Memuat pesan saat server dimulai
let messages = loadMessages();

module.exports = (req, res) => {
  if (!wss) {
    wss = new WebSocket.Server({ noServer: true });

    wss.on('connection', (ws) => {
      // Kirim riwayat pesan ke klien baru
      ws.send(JSON.stringify({ type: 'history', messages }));

      ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'join') {
          // Beritahu klien lain bahwa pengguna baru bergabung
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'join', username: data.username }));
            }
          });
        } else if (data.type === 'message') {
          // Saring pesan sebelum menyimpan dan mengirim
          const censoredMessage = censorMessage(data.message);
          const newMessage = { username: data.username, message: censoredMessage };

          // Simpan pesan
          messages.push(newMessage);
          saveMessages(messages);

          // Kirim pesan ke semua klien
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
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
