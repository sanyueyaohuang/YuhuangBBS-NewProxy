const fetch = require('node-fetch');
const { URL } = require('url');

module.exports = async (req, res) => {
  const targetBaseUrl = 'https://bbs.yuhuangonly.com';
  const { path } = req.query;

  if (!path) {
    res.status(400).send('No path provided');
    return;
  }

  try {
    const targetUrl = new URL(path, targetBaseUrl).toString();

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(targetBaseUrl).host
      },
      body: req.method === 'GET' || req.method === 'HEAD' ? null : req.body
    });

    const contentType = response.headers.get('content-type');
    res.setHeader('content-type', contentType);

    if (contentType && contentType.includes('text/html')) {
      // Rewrite URLs in HTML content
      let body = await response.text();
      body = body.replace(/href="\/(.*?)"/g, `href="/api/proxy?path=/$1"`);
      body = body.replace(/src="\/(.*?)"/g, `src="/api/proxy?path=/$1"`);

      res.send(body);
    } else {
      // Stream other types of content directly
      response.body.pipe(res);
    }
  } catch (error) {
    console.error('Error fetching the URL:', error.message);
    res.status(500).send('Internal Server Error');
  }
};
