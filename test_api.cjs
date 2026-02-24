const http = require('http');

http.get('http://localhost:8081/api/products', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response length:', data.length));
}).on('error', err => console.error(err));
