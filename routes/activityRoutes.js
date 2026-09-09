const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Event = require('../models/event');
const Gallery = require('../models/gallery');

// --- יצירת תיקיית ההעלאות אוטומטית אם אינה קיימת ---
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// -----------------------------------------------------

const storage = multer.diskStorage({
    destination: function (req, file, cb) { 
        cb(null, 'public/uploads/'); 
    },
    filename: function (req, file, cb) { 
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });

// --- נתיבי אירועים ---
router.get('/events/:courtId', async (req, res) => {
    try {
        const now = new Date();
        const events = await Event.find({ courtId: req.params.courtId, eventDate: { $gte: now } }).sort({ eventDate: 1 });
        res.json(events);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

router.post('/events', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'רק משתמשים רשומים יכולים לפתוח אירוע' });
    try {
        const newEvent = new Event({
            courtId: req.body.courtId,
            creator: req.user.username,
            title: req.body.title,
            eventType: req.body.eventType,
            description: req.body.description,
            eventDate: req.body.eventDate
        });
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// --- נתיבי גלריה ---
router.get('/gallery/:courtId', async (req, res) => {
    try {
        const media = await Gallery.find({ courtId: req.params.courtId }).sort({ createdAt: -1 });
        res.json(media);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

router.post('/gallery', upload.single('mediaFile'), async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'חובה להתחבר כדי להעלות קבצים' });
    if (!req.file) return res.status(400).json({ message: 'לא נבחר קובץ' });
    
    try {
        const fileType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
        const newMedia = new Gallery({
            courtId: req.body.courtId,
            uploader: req.user.username,
            fileUrl: '/uploads/' + req.file.filename,
            fileType: fileType
        });
        await newMedia.save();
        res.status(201).json(newMedia);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

module.exports = router;