const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// JSONリクエストを解析するミドルウェア
app.use(express.json());

// シンプルなルート
app.get('/', (req, res) => {
    res.send('Hello, World! 今井優！！！！！！！！！！！');
});

// 動的なエンドポイント: 名前を受け取って挨拶を返す
app.post('/greet', (req, res) => {
    const { name } = req.body; // リクエストボディから名前を取得
    if (!name) {
        return res.status(400).json({ message: 'Name is required' }); // エラー応答
    }
    res.json({ message: `Hello, ${name}!` }); // 動的な応答
});

// サーバーを起動
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
