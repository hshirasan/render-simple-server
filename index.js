const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// 静的ファイルの提供
app.use(express.static('public')); // `public` フォルダを静的ファイル用に指定

// ハードコードされたパスワード
const HOST_PASSWORD = '1134';

// 現在の設定を保持する変数
let currentSettings = { color: 'red', blinkPattern: 'always', timestamp: Date.now() };

// WebSocket接続の管理
io.on('connection', (socket) => {
    console.log(`Connection from socket: ${socket.id}`);

    // ホスト認証の処理
    socket.on('authenticate-host', (password, callback) => {
        if (password === HOST_PASSWORD) {
            console.log(`Host authenticated: ${socket.id}`);
            callback({ success: true });
        } else {
            console.log(`Host authentication failed: ${socket.id}`);
            callback({ success: false, message: 'Invalid password' });
            socket.disconnect(); // 認証失敗時に接続を切断
        }
    });

    // クライアントが接続した際に最新設定を送信
    socket.emit('update-display', currentSettings);

    // クライアントが設定を更新
    socket.on('update-settings', (settings) => {
        settings.timestamp = Date.now(); // タイムスタンプを追加
        console.log('Received settings:', settings);

        currentSettings = settings; // 最新設定を保存
        io.emit('update-display', currentSettings); // すべてのクライアントに設定を送信
    });

    // 切断時
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

// クライアントに定期的に心拍信号を送信
setInterval(() => {
    io.emit('heartbeat', { timestamp: Date.now() });
}, 3000); // 3秒ごとに送信

// サーバー起動
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
