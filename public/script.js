// Daftar kata-kata kotor
const badWords = ['kata1', 'kata2', 'kata3', 'kata4'];  // Ganti dengan kata-kata yang sesuai

// Menghubungkan ke WebSocket server
const socket = new WebSocket('ws://localhost:8080');

// DOM elements
const loginDiv = document.getElementById('login');
const chatboxDiv = document.getElementById('chatbox');
const usernameInput = document.getElementById('username');
const joinButton = document.getElementById('joinButton');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('sendButton');
const messagesDiv = document.getElementById('messages');

// Fungsi untuk memfilter kata-kata kotor
function censorMessage(message) {
    let censoredMessage = message;
    badWords.forEach((badWord) => {
        const regex = new RegExp(badWord, 'gi'); // Case-insensitive
        censoredMessage = censoredMessage.replace(regex, '*'.repeat(badWord.length));
    });
    return censoredMessage;
}

// Menyembunyikan login dan menampilkan chatroom
joinButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        socket.send(JSON.stringify({ type: 'join', username }));
        loginDiv.style.display = 'none';
        chatboxDiv.style.display = 'flex';
    }
});

// Fungsi untuk menambahkan pesan ke chatbox
function appendMessage(username, message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${username}: ${message}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Kirim pesan ke WebSocket server ketika tombol kirim diklik
sendButton.addEventListener('click', () => {
    let message = messageInput.value;
    if (message) {
        const username = usernameInput.value.trim();
        // Censor pesan sebelum mengirim
        const censoredMessage = censorMessage(message);
        socket.send(JSON.stringify({ type: 'message', username, message: censoredMessage }));
        appendMessage(username, censoredMessage);
        messageInput.value = '';
    }
});

// Menampilkan pesan yang diterima dari server
socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'message') {
        appendMessage(data.username, data.message);
    } else if (data.type === 'join') {
        appendMessage('Server', `${data.username} telah bergabung.`);
    }
});
