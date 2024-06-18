const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    res.status(400).send('No URL provided');
    return;
  }

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(url).host
      },
      body: req.method === 'GET' || req.method === 'HEAD' ? null : req.body
    });

    // Set the headers from the proxied response
    response.headers.forEach((value, name) => {
      res.setHeader(name, value);
    });

    // Stream the response body
    response.body.pipe(res);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
