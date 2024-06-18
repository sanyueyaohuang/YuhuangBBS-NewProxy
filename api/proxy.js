const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const targetBaseUrl = 'https://bbs.yuhuangonly.com';
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
      },
      body: req.method === 'GET' || req.method === 'HEAD' ? null : req.body,
    });

    // Forward status and headers
    res.status(response.status);
    response.headers.forEach((value, name) => {
      res.setHeader(name, value);
    });

    // Stream the response body
    response.body.pipe(res);
  } catch (error) {
    console.error('Error fetching the URL:', error);
    res.status(500).send('Internal Server Error');
  }
};
