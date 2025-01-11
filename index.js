const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// シンプルなルート
app.get('/', (req, res) => {
    res.send('Hello, World!  今井優！');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});