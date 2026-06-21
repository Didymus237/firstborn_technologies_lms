const http = require('http');

const data = JSON.stringify({
  title: 'Test',
  description: 'Test',
  category: 'Academic',
  priority: 'Low'
});

const req = http.request({
  hostname: 'localhost',
  port: 8001,
  path: '/api/complaints',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', d => process.stdout.write(d));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
EOF
node test_404.js
