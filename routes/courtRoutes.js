const express = require('express');
const router = express.Router();
// אנחנו משתמשים ב-fetch המובנה של Node (זמין מגרסה 18+)

router.get('/live-data', async (req, res) => {
    const query = `
        [out:json];
        (
          node["leisure"="pitch"](31.8, 34.6, 32.2, 35.0);
          way["leisure"="pitch"](31.8, 34.6, 32.2, 35.0);
        );
        out center;
    `;

    try {
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: "data=" + encodeURIComponent(query)
        });
        
        if (!response.ok) {
            throw new Error(`Overpass API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error proxying Overpass data:', error);
        res.status(500).json({ error: 'Failed to fetch court data from satellite' });
    }
});

module.exports = router;