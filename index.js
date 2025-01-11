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
let currentSettings = { color: 'black', blinkInterval: 1000 };

// WebSocket接続の管理
io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    // クライアントが接続した際に最新設定を送信
    socket.emit('update-display', currentSettings);

    // ホストから設定を受け取る
    socket.on('update-settings', (settings) => {
        console.log('Received settings from host:', settings);
        currentSettings = settings; // 最新設定を更新

        // すべてのクライアントに設定を送信
        io.emit('update-display', currentSettings);
    });

    // 切断時の処理
    socket.on('disconnect', () => {
        console.log('A client disconnected:', socket.id);
    });
});

// サーバー起動
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
