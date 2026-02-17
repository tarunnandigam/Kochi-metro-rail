const http = require('http');
const options = { method: 'POST', host: 'localhost', port: 5000, path: '/api/metro/init-stations' };
const req = http.request(options, res => {
  console.log('STATUS', res.statusCode);
  let d=''; res.on('data',c=>d+=c); res.on('end',()=>{ console.log('BODY', d); });
});
req.on('error', e=> console.error('ERR', e.message));
req.end();
