
const { parse } = require('url');

module.exports = async (req, res) => {
    // Target Setup
    // Target Setup
    const TARGET_BASE = 'https://ttmouse.com';

    // Parse Incoming URL
    // req.url in Vercel function is usually the path relative to the function.
    // However, simplest way is to extract the path from the request.

    const url = req.url.startsWith('/api/') ? req.url : `/api${req.url}`;
    const targetUrl = `${TARGET_BASE}${url}`;

    // Pass headers
    const headers = { ...req.headers };
    delete headers.host; // removing host header to avoid confusion at target
    headers['host'] = 'ttmouse.com';

    try {
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: headers,
            body: ['GET', 'HEAD'].includes(req.method) ? null : JSON.stringify(req.body)
        });

        // Copy response headers
        response.headers.forEach((value, key) => {
            res.setHeader(key, value);
        });

        // Set status
        res.status(response.status);

        // Pipe body
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));

    } catch (e) {
        console.error('Proxy Error:', e);
        res.status(500).json({ error: 'Proxy Error', details: e.message });
    }
};
