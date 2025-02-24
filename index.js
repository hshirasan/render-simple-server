// Filename: server.js
// Version: server_v1.4.16

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'public')));

let currentSettings = {}; // 最新の制御状態を保持

// 定期的に心拍信号を送信
setInterval(() => {
    io.emit('heartbeat', { timestamp: Date.now() });
}, 2000); // 2秒ごとに送信

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // 接続時に最新状態を送信
    if (Object.keys(currentSettings).length > 0) {
        socket.emit('update-display', currentSettings);
        console.log(`Sent current settings to new client: ${JSON.stringify(currentSettings)}`);
    }

    // ホストからの制御設定を受信
    socket.on('update-settings', (settings) => {
        currentSettings = settings; // 最新状態を更新
        console.log(`Updated settings: ${JSON.stringify(settings)}`);
        io.emit('update-display', settings); // すべてのクライアントに送信
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// サーバーを開始
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
