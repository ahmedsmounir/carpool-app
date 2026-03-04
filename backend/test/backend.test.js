const assert = require('assert');
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/users',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = http.request(options, (res) => {
  assert.strictEqual(res.statusCode, 201, 'Expected 201 Created');
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const user = JSON.parse(data);
    assert.strictEqual(user.name, 'Test User', 'Expected name to match');
    assert.strictEqual(user.role, 'driver', 'Expected role to match');
    console.log('Backend API tests passed!');
  });
});

req.on('error', (error) => {
  console.error(error);
  process.exit(1);
});

req.write(JSON.stringify({ name: 'Test User', role: 'driver' }));
req.end();
