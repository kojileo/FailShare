const express = require('express');
const path = require('path');
const app = express();

// 環境変数からポートを取得（Cloud Runが自動設定）
const PORT = process.env.PORT || 8080;

// 静的ファイルの配信
app.use(express.static(path.join(__dirname, 'dist')));

// SPA用のルーティング（すべてのルートでindex.htmlを返す）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// サーバー起動
app.listen(PORT, '0.0.0.0', () => {
  console.log(`FailShare Web Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.EXPO_PUBLIC_ENVIRONMENT || 'production'}`);
}); 