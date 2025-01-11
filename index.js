const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// 静的ファイルの提供（publicディレクトリをホスティング）
app.use(express.static('public'));

// WebSocket接続の管理
io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    // ホストから設定を受け取る
    socket.on('update-settings', (settings) => {
        console.log('Received settings from host:', settings);

        // すべてのクライアントに設定を送信
        socket.broadcast.emit('update-display', settings);
    });

    // 切断時の処理
    socket.on('disconnect', () => {
        console.log('A client disconnected:', socket.id);
    });
});

// デフォルトルート（/）を追加
app.get('/', (req, res) => {
    res.send('WebSocket Server is running. Please access /host.html or /client.html in the public folder.');
});

// サーバー起動
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
