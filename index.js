const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// 静的ファイルの提供
app.use(express.static('public'));

// 現在の設定を保持する変数
let currentSettings = { color: 'red', blinkPattern: 'always', timestamp: Date.now() };

// WebSocket接続の管理
io.on('connection', (socket) => {
    console.log(`Connection from socket: ${socket.id}`);

    // クライアントが接続した際に最新設定を送信
    socket.emit('update-display', currentSettings);

    // クライアントが設定を更新
    socket.on('update-settings', (settings) => {
        settings.timestamp = Date.now(); // タイムスタンプを追加
        console.log('Received settings:', settings);

        currentSettings = settings; // 最新設定を保存
        io.emit('update-display', currentSettings); // すべてのクライアントに設定を送信
    });

    // 切断時に特定のイベントをトリガーしない
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

// サーバー起動
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
