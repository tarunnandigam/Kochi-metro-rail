const http = require('http');

function check(path, host='127.0.0.1', port=5000) {
  return new Promise((resolve) => {
    const options = { hostname: host, port, path, method: 'GET', timeout: 5000 };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ ok: true, statusCode: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'timeout' }); });
    req.end();
  });
}

(async () => {
  const endpoints = [
    { host: '127.0.0.1', port: 5000, path: '/api/welcome' },
    { host: '127.0.0.1', port: 5000, path: '/api/metro/stations' },
    { host: '127.0.0.1', port: 5000, path: '/api/metro/trains/live' },
    { host: '127.0.0.1', port: 3001, path: '/' },
  ];

  for (const e of endpoints) {
    process.stdout.write(`Checking http://${e.host}:${e.port}${e.path} ... `);
    const r = await check(e.path, e.host, e.port);
    if (!r.ok) {
      console.log(`FAILED — ${r.error}`);
    } else {
      console.log(`OK ${r.statusCode}`);
      if (r.body && r.body.length < 2000) console.log(r.body);
      else if (r.body) console.log(r.body.substring(0, 2000) + '\n...[truncated]');
    }
    console.log('---');
  }
})();
