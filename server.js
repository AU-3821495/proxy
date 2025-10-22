const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const app = express();

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

app.use('/proxy', createProxyMiddleware({
  target: 'https://example.com', // ダミー。実際はクエリで動的指定
  changeOrigin: true,
  pathRewrite: (path, req) => {
    const url = req.query.url;
    return url ? '/' + url.replace(/^https?:\/\//, '') : '';
  },
  onProxyReq: (proxyReq, req, res) => {
    if (config.blocklist.some(domain => req.url.includes(domain))) {
      res.status(403).send('Blocked by proxy');
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // Rangeヘッダーなど動画対応のための処理
    if (proxyRes.headers['content-type']?.includes('video')) {
      proxyRes.headers['accept-ranges'] = 'bytes';
    }
  }
}));

app.listen(3000, () => console.log('Proxy running on http://localhost:3000'));

