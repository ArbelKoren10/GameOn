const express = require('express');
const router = express.Router();
const axios = require('axios');

// משתנה גלובלי שישמור את נתוני המגרשים וימנע פניות מיותרות ל-Overpass
let courtsCache = null;

router.get('/live-data', async (req, res) => {
    // אם הנתונים כבר שמורים בשרת שלנו - החזר אותם מיד (אפס דיליי)
    if (courtsCache) {
        return res.json(courtsCache);
    }

    const query = `
        [out:json][timeout:25];
        (
          node["leisure"="pitch"](31.90, 34.70, 32.10, 34.90);
          way["leisure"="pitch"](31.90, 34.70, 32.10, 34.90);
        );
        out center;
    `;

    try {
        // שימוש ב-axios לפנייה לשרת הצרפתי של Overpass
        const response = await axios.post('https://overpass.kumi.systems/api/interpreter', "data=" + encodeURIComponent(query), {
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'PitchConnectApp/1.0' 
            },
            timeout: 25000 // הגבלת זמן ל-25 שניות
        });
        
        // שמירת הנתונים במטמון
        courtsCache = response.data;
        res.json(courtsCache);
    } catch (error) {
        console.error('Error proxying Overpass data:', error.message);
        
        // אם שוב יש עומס בשרת, נחזיר קבוצה קטנה של מגרשים "קשיחים" (Hardcoded) בראשון לציון כדי שהאפליקציה לא תקרוס
        if (!courtsCache) {
            console.log('Falling back to local fallback data...');
            res.json({
                elements: [
                    { id: 1, type: 'node', tags: { name: 'מגרש כדורגל נאות אשלים', sport: 'soccer' }, lat: 31.9680, lon: 34.7700 },
                    { id: 2, type: 'node', tags: { name: 'מגרש כדורסל קרית גנים', sport: 'basketball' }, lat: 31.9750, lon: 34.7800 },
                    { id: 3, type: 'node', tags: { name: 'מגרש טניס שיכון המזרח', sport: 'tennis' }, lat: 31.9600, lon: 34.8100 },
                    { id: 4, type: 'node', tags: { name: 'מגרש ספורטק', sport: 'soccer' }, lat: 31.9830, lon: 34.7550 }
                ]
            });
        } else {
             res.status(500).json({ error: 'Failed to fetch court data' });
        }
    }
});

module.exports = router;