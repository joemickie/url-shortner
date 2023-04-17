const http = require('http');
const fs = require('fs');

const PORT = 8000;

// create a server to handle incoming requests
const server = http.createServer((req, res) => {
  // handle GET requests
  if (req.method === 'GET') {
    // check if requested URL is a short URL
    const shortUrl = req.url.substring(1); // remove leading '/'
    const longUrl = getLongUrl(shortUrl);
    if (longUrl) {
      // redirect to the long URL
      res.writeHead(301, { Location: longUrl });
      return res.end();
    }
  }

  // handle POST requests
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      // extract the long URL from the POST body
      const longUrl = JSON.parse(body).url;

      // generate a unique short URL
      const shortUrl = generateShortUrl();

      // store the short URL and long URL mapping in a file
      storeUrlMapping(shortUrl, longUrl);

      // send the short URL back to the client
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ url: `http://localhost:${PORT}/${shortUrl}` }));
    });
  }

  // handle other requests
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// function to generate a unique short URL
function generateShortUrl() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let shortUrl = '';
  for (let i = 0; i < 6; i++) {
    shortUrl += chars[Math.floor(Math.random() * chars.length)];
  }
  return shortUrl;
}

// function to store the short URL and long URL mapping in a file
function storeUrlMapping(shortUrl, longUrl) {
  fs.appendFileSync('url_mappings.txt', `${shortUrl} ${longUrl}\n`);
}

// function to get the long URL for a given short URL
function getLongUrl(shortUrl) {
  const urlMappings = fs.readFileSync('url_mappings.txt', 'utf-8');
  const mappings = urlMappings.trim().split('\n');
  for (const mapping of mappings) {
    const [url, longUrl] = mapping.split(' ');
    if (url === shortUrl) {
      return longUrl;
    }
  }
  return null;
}
