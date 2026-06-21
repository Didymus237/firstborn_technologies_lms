const http = require('http');
const https = require('https');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign({ id: '60d5ecb74d6bb830d8c22222', role: 'student' }, process.env.JWT_SECRET || 'secret');

const data = JSON.stringify({
  title: 'Test',
  description: 'Test',
  category: 'Academic',
  priority: 'Low'
});

const req = http.request('http://localhost:8001/api/complaints', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Cookie': `jwt=${token}`
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', body));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
EOF
node test_submit.js
