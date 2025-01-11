const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// 静的ファイルの提供
app.use(express.static('public'));

// 現在のホストを保持
let hostSocketId = null;

// 現在の設定を保持する変数
let currentSettings = { color: 'black', blinkPattern: 'always', timestamp: Date.now() };

// WebSocket接続の管理
io.on('connection', (socket) => {
    console.log(`Connection from socket: ${socket.id}`);

    // ホストがいない場合、新しい接続者をホストに設定
    if (!hostSocketId) {
        hostSocketId = socket.id;
        console.log(`Host assigned: ${hostSocketId}`);
    }

    // ホストステータスをクライアントに通知
    const isHost = socket.id === hostSocketId;
    socket.emit('host-status', { isHost });

    // クライアントが接続した際に最新設定を送信
    socket.emit('update-display', currentSettings);

    // ホストが設定を更新
    socket.on('update-settings', (settings) => {
        if (socket.id === hostSocketId) {
            settings.timestamp = Date.now(); // タイムスタンプを追加
            console.log('Received settings from host:', settings);

            currentSettings = settings; // 最新設定を保存
            io.emit('update-display', currentSettings); // すべてのクライアントに設定を送信
        } else {
            console.log('Unauthorized settings update attempt.');
        }
    });

    // 切断時
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);

        if (socket.id === hostSocketId) {
            console.log('Host disconnected. Releasing host control.');
            hostSocketId = null; // ホスト権限を解除
        }

        // 現在のホストがいなくなった状態をログで確認
        if (!hostSocketId) {
            console.log('No host present. Waiting for new host connection...');
        }
    });
});

// サーバー起動
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
