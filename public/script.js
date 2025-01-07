// Koneksi WebSocket
const socket = new WebSocket('wss://chatroom-viper404.vercel.app/api/ws'); // Ganti URL jika server Anda di-host online

// Elemen DOM
const loginDiv = document.getElementById('login');
const chatboxDiv = document.getElementById('chatbox');
const usernameInput = document.getElementById('username');
const joinButton = document.getElementById('joinButton');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('sendButton');
const messagesDiv = document.getElementById('messages');

let currentUsername = '';

// Fungsi untuk menambahkan pesan ke chatbox
function appendMessage(username, message, type = 'other') {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${username}: ${message}`;
    messageElement.classList.add('message', type);
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Fungsi untuk menyensor kata-kata kasar
const badWords = ['kata1', 'kata2', 'kata3']; // Ganti dengan daftar kata-kata kotor
function censorMessage(message) {
    let censoredMessage = message;
    badWords.forEach((badWord) => {
        const regex = new RegExp(`\\b${badWord}\\b`, 'gi');
        censoredMessage = censoredMessage.replace(regex, '*'.repeat(badWord.length));
    });
    return censoredMessage;
}

// Event ketika tombol "Gabung" diklik
joinButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        currentUsername = username;
        socket.send(JSON.stringify({ type: 'join', username }));
        loginDiv.style.display = 'none';
        chatboxDiv.style.display = 'flex';
    } else {
        alert('Nama pengguna tidak boleh kosong!');
    }
});

// Event ketika tombol "Kirim" diklik
sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        const censoredMessage = censorMessage(message);
        socket.send(JSON.stringify({ type: 'message', username: currentUsername, message: censoredMessage }));
        appendMessage('Anda', censoredMessage, 'user');
        messageInput.value = '';
    }
});

// Event ketika pesan diterima dari server
socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'join') {
        appendMessage('Server', `${data.username} telah bergabung.`, 'server');
    } else if (data.type === 'message') {
        const type = data.username === currentUsername ? 'user' : 'other';
        appendMessage(data.username, data.message, type);
    }
});
