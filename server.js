const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const app = express();

app.use('/proxy', createProxyMiddleware({
  target: 'https://example.com', // 動的に変更するならURLをクエリから取得
  changeOrigin: true,
  pathRewrite: (path, req) => {
    const url = req.query.url;
    return url ? '/' + url.replace(/^https?:\/\//, '') : '';
  },
  onProxyReq: (proxyReq, req, res) => {
    if (config.blocklist.some(domain => req.url.includes(domain))) {
      res.status(403).send('Blocked by proxy');
    }
  }
}));

app.listen(3000, () => console.log('Proxy running on http://localhost:3000'));
