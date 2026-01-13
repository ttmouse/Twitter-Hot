
const { parse } = require('url');

module.exports = async (req, res) => {
    // Target Setup
    const TARGET_BASE = 'http://38.55.192.139:5502';

    // Parse Incoming URL
    // req.url in Vercel function is usually the path after /api/proxy/...? 
    // But since we use rewrites, we need to be careful.
    // If rewrite is /api/(.*) -> /api/proxy, req.url might be /api/proxy?params... 
    // better to rely on original url or construct it.

    // Actually, simply forwarding params and path.
    // Let's assume the client calls /api/data?date=...
    // We want to forward to http://38.55.192.139:5502/api/data?date=...

    // In Vercel, req.url is indeed the path relative to the function, but with rewrites it's tricky.
    // Let's rely on req.url which should preserve the full path if we use it correctly.
    // However, simplest way is to extract the path from the request.

    const url = req.url.startsWith('/api/') ? req.url : `/api${req.url}`;
    const targetUrl = `${TARGET_BASE}${url}`;

    // Pass headers
    const headers = { ...req.headers };
    delete headers.host; // removing host header to avoid confusion at target
    headers['host'] = '38.55.192.139:5502';

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
