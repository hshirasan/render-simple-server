const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// 静的ファイルの提供
app.use(express.static('public'));

// ハードコードされたパスワード
const HOST_PASSWORD = '1134';

// 現在の設定を保持する変数
let currentSettings = { color: 'red', blinkPattern: 'always', timestamp: Date.now() };
let currentHostId = null; // 現在のホストIDを管理111

// WebSocket接続の管理
io.on('connection', (socket) => {
    console.log(`Connection from socket: ${socket.id}`);

    // ホスト認証
    socket.on('authenticate-host', (password, callback) => {
        if (password === HOST_PASSWORD) {
            currentHostId = socket.id; // ホストIDを設定
            console.log(`Host authenticated: ${socket.id}`);
            callback({ success: true });
        } else {
            console.log(`Host authentication failed: ${socket.id}`);
            callback({ success: false, message: 'Invalid password' });
            socket.disconnect();
        }
    });

    // 初期設定を送信
    socket.emit('update-display', currentSettings);

    // 設定の更新（ホストのみ許可）
    socket.on('update-settings', (settings) => {
        if (socket.id !== currentHostId) {
            console.warn(`Non-host socket ${socket.id} attempted to update settings.`);
            return; // ホスト以外は無視
        }

        settings.timestamp = Date.now();
        currentSettings = settings;
        io.emit('update-display', currentSettings);
    });

    // クライアント切断時の処理
    socket.on('disconnect', () => {
        if (socket.id === currentHostId) {
            console.log(`Host disconnected: ${socket.id}`);
            currentHostId = null; // ホスト権限をリセット
        }
    });
});

// 定期的な心拍信号を送信
setInterval(() => {
    io.emit('heartbeat', { timestamp: Date.now() });
}, 3000);

// サーバー起動
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
