const fetch = require('node-fetch');
const { pipeline } = require('stream');
const zlib = require('zlib');

module.exports = async (req, res) => {
  const targetBaseUrl = 'http://bbs.yuhuangonly.com';
  const path = req.query.path || '';

  console.log('Received request:', req.url);
  console.log('Query parameters:', req.query);
  console.log('Path:', path);

  if (!path) {
    console.error('No path provided');
    res.status(400).send('No path provided');
    return;
  }

  try {
    const targetUrl = `${targetBaseUrl}${path}`;
    console.log(`Fetching URL: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(targetBaseUrl).host,
        'accept-encoding': 'gzip, deflate',  // Ensure encoding headers are set
      },
      body: req.method === 'GET' || req.method === 'HEAD' ? null : req.body,
    });

    // Forward status and headers
    res.status(response.status);
    response.headers.forEach((value, name) => {
      if (name.toLowerCase() !== 'content-encoding') {
        res.setHeader(name, value);
      }
    });

    const encoding = response.headers.get('content-encoding');

    if (encoding === 'gzip') {
      // Pipe the response through a gzip decoder
      pipeline(response.body, zlib.createGunzip(), res, (err) => {
        if (err) {
          console.error('Pipeline failed:', err);
          res.status(500).send('Internal Server Error');
        }
      });
    } else if (encoding === 'deflate') {
      // Pipe the response through a deflate decoder
      pipeline(response.body, zlib.createInflate(), res, (err) => {
        if (err) {
          console.error('Pipeline failed:', err);
          res.status(500).send('Internal Server Error');
        }
      });
    } else {
      // Stream the response body directly
      pipeline(response.body, res, (err) => {
        if (err) {
          console.error('Pipeline failed:', err);
          res.status(500).send('Internal Server Error');
        }
      });
    }
  } catch (error) {
    console.error('Error fetching the URL:', error);
    res.status(500).send('Internal Server Error');
  }
};
