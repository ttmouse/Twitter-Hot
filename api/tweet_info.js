const https = require('https');

const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

module.exports = (req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { id } = req.query;

    if (!id) {
        res.status(400).json({ error: 'missing_id' });
        return;
    }

    const url = `https://api.vxtwitter.com/Twitter/status/${id}`;

    const request = https.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            // Forward the status code and data
            res.status(response.statusCode);
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
            res.send(data);
        });
    });

    request.on('error', (error) => {
        console.error('Proxy Request Error:', error);
        res.status(500).json({ error: 'proxy_error', details: error.message });
    });
};
