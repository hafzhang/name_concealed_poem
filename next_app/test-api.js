const http = require('http');

const data = JSON.stringify({
  poem: ["一", "二", "三", "四"],
  style: "kaishu",
  bg: "rice_paper",
  frame: "none"
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/render-image',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('BODY:', body));
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();