const express = require('express');
const path = require('path');
const app = express();

// X-Powered-Byヘッダーを無効化（セキュリティ対策）
app.disable('x-powered-by');

// 環境変数からポートを取得（Cloud Runが自動設定）
const PORT = process.env.PORT || 8080;

// 静的ファイルの配信（SPAのdistディレクトリを優先）
app.use(express.static(path.join(__dirname, 'dist')));

// SEOファイルの配信（特定のパスのみ）
app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  const robots = `User-agent: *
Allow: /

# クロール間隔（秒）
Crawl-delay: 1

# サイトマップ
Sitemap: https://fail-share.com/sitemap.xml

# 特定のパスの制御
Disallow: /api/
Disallow: /admin/
Disallow: /private/`;
  res.send(robots);
});

app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD形式
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://fail-share.com/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://fail-share.com/stories</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://fail-share.com/profile</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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