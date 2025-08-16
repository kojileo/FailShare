const express = require('express');
const path = require('path');
const app = express();

// 環境変数からポートを取得（Cloud Runが自動設定）
const PORT = process.env.PORT || 8080;

// 静的ファイルの配信（SPAのdistディレクトリを優先）
app.use(express.static(path.join(__dirname, 'dist')));

// SEOファイルの配信（特定のパスのみ）
app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  const robots = `User-agent: *
Allow: /

Sitemap: https://fail-share.com/sitemap.xml`;
  res.send(robots);
});

app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://fail-share.com/</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  res.send(sitemap);
});

// SPA用のルーティング（すべてのルートでindex.htmlを返す）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// サーバー起動
app.listen(PORT, '0.0.0.0', () => {
  console.log(`FailShare Web Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.EXPO_PUBLIC_ENVIRONMENT || 'production'}`);
}); 