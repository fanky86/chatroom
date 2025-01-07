// Daftar kata-kata kotor untuk disensor
const badWords = ['bokep', 'anjing', 'tolol', 'asu']; // Ganti dengan kata-kata yang sesuai

// DOM elements
const loginDiv = document.getElementById('login');
const chatboxDiv = document.getElementById('chatbox');
const usernameInput = document.getElementById('username');
const joinButton = document.getElementById('joinButton');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('sendButton');
const messagesDiv = document.getElementById('messages');

let currentUsername = ''; // Untuk menyimpan nama pengguna

// Fungsi untuk menyensor pesan
function censorMessage(message) {
    let censoredMessage = message;
    badWords.forEach((badWord) => {
        const regex = new RegExp(`\\b${badWord}\\b`, 'gi'); // Hanya kata lengkap
        censoredMessage = censoredMessage.replace(regex, '*'.repeat(badWord.length));
    });
    return censoredMessage;
}

// Fungsi untuk menambahkan pesan ke chatbox
function appendMessage(username, message, type = 'other') {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${username}: ${message}`;
    messageElement.classList.add('message', type);
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll otomatis ke bawah
}

// Menyembunyikan login dan menampilkan chatroom
joinButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        currentUsername = username;
        socket.send(JSON.stringify({ type: 'join', username }));
        loginDiv.style.display = 'none';
        chatboxDiv.style.display = 'flex';
    }
});

// Kirim pesan ke WebSocket server ketika tombol kirim diklik
sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        const censoredMessage = censorMessage(message); // Sensor pesan sebelum dikirim
        socket.send(JSON.stringify({ type: 'message', username: currentUsername, message: censoredMessage }));
        appendMessage('Anda', censoredMessage, 'user'); // Pesan milik pengguna
        messageInput.value = '';
    }
});

// Tampilkan pesan yang diterima dari server
socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'history') {
        // Tampilkan riwayat pesan
        data.messages.forEach((msg) => {
            const type = msg.username === currentUsername ? 'user' : 'other';
            appendMessage(msg.username, msg.message, type);
        });
    } else if (data.type === 'message') {
        const type = data.username === currentUsername ? 'user' : 'other';
        appendMessage(data.username, data.message, type);
    } else if (data.type === 'join') {
        appendMessage('Server', `${data.username} telah bergabung.`, 'server');
    }
});
