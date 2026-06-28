const http = require('http');

http.get('http://localhost:3000/api/mobile/lessons/cmqcu0p7r0008jo04jddg2q2n', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
