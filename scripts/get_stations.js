const http = require('http');
http.get('http://127.0.0.1:5000/api/metro/stations', res=>{
  console.log('STATUS', res.statusCode);
  let d=''; res.on('data',c=>d+=c); res.on('end',()=>{ console.log('LEN', d.length); console.log(d.slice(0,1000)); require('fs').writeFileSync('stations.json', d);});
}).on('error', e=> console.error('ERR', e.message));
