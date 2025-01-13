// Filename: server_code.js
// Revision: 2

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// 固定パスワード
const HOST_PASSWORD = '1134';

// 静的ファイルの提供
app.use(express.static('public'));

// 現在の設定を保持する変数
let currentSettings = { color: 'black', blinkPattern: 'none', timestamp: Date.now() };

// WebSocket接続の管理
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // パスワード認証
    socket.on('authenticate-host', (password, callback) => {
        if (password === HOST_PASSWORD) {
            console.log('Host authenticated successfully.');
            callback({ success: true });
        } else {
            console.log('Host authentication failed.');
            callback({ success: false, message: 'Invalid password.' });
        }
    });

    // クライアントに初期設定を送信
    socket.emit('update-display', currentSettings);

    // クライアントから設定を受信
    socket.on('update-settings', (settings) => {
        console.log('Received settings:', settings);

        currentSettings = { ...settings, timestamp: Date.now() };

        // すべてのクライアントに設定をブロードキャスト
        io.emit('update-display', currentSettings);
    });

    // クライアントが切断した際の処理
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// サーバーの起動
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
