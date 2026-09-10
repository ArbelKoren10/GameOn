const fs = require('fs');

const query = `
    [out:json][timeout:90];
    (
      node["leisure"="pitch"](31.8, 34.6, 32.2, 35.0);
      way["leisure"="pitch"](31.8, 34.6, 32.2, 35.0);
    );
    out center;
`;

async function fetchCourts() {
    console.log('מתחבר ללוויין של Overpass להורדת נתונים... (זה עשוי לקחת עד דקה, אנא המתן)');
    try {
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'User-Agent': 'PitchConnectApp/1.0' // ההזדהות שמונעת שגיאת 406
            },
            body: "data=" + encodeURIComponent(query)
        });
        
        if (!response.ok) throw new Error('API Error: ' + response.status);
        
        const data = await response.json();
        fs.writeFileSync('./public/courts.json', JSON.stringify(data));
        console.log(`✅ הצלחה! נשמרו ${data.elements.length} מגרשים לקובץ public/courts.json`);
        console.log('כעת האפליקציה תטען את המגרשים מקומית באפס זמן ויציבות מוחלטת!');
    } catch (error) {
        console.error('❌ שגיאה בהורדת הנתונים:', error.message);
    }
}

fetchCourts();