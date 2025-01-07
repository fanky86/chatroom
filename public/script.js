// Inisialisasi WebSocket
const socket = new WebSocket('wss://chatroom-viper404.vercel.app'); // Ganti dengan URL server WebSocket Anda

socket.addEventListener('open', () => {
    console.log('WebSocket terhubung.');
});

socket.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
});

socket.addEventListener('close', () => {
    console.log('WebSocket terputus.');
});

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
const badWords = ['bokep', 'anjing', 'asu']; // Ganti dengan kata-kata kotor
function censorMessage(message) {
    let censoredMessage = message;
    badWords.forEach((badWord) => {
        const regex = new RegExp(`\\b${badWord}\\b`, 'gi');
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
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Event listener untuk tombol "Gabung"
joinButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        console.log(`Username: ${username}`); // Debugging log
        currentUsername = username;
        socket.send(JSON.stringify({ type: 'join', username }));
        loginDiv.style.display = 'none';
        chatboxDiv.style.display = 'flex';
    } else {
        alert('Nama pengguna tidak boleh kosong!');
    }
});

// Kirim pesan ke server ketika tombol "Kirim" diklik
sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        const censoredMessage = censorMessage(message);
        socket.send(JSON.stringify({ type: 'message', username: currentUsername, message: censoredMessage }));
        appendMessage('Anda', censoredMessage, 'user');
        messageInput.value = '';
    }
});

// Tampilkan pesan yang diterima dari server
socket.addEventListener('message', (event) => {
    console.log('Pesan diterima:', event.data); // Debugging log
    const data = JSON.parse(event.data);

    if (data.type === 'history') {
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
