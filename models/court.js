const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    city: {
        type: String,
        default: 'ראשון לציון' // הגדרתי עיר ברירת מחדל שתעזור לנו כשנזין נתוני דמה למפה
    },
    sportType: {
        type: String,
        enum: ['כדורגל', 'כדורסל', 'טניס'],
        required: true
    },
    hasLighting: {
        type: Boolean,
        default: false
    },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    }
}, { timestamps: true });

module.exports = mongoose.model('Court', courtSchema);