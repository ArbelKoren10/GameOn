const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    // סיסמה לא חובה כי משתמשי Google לא יזינו סיסמה באתר שלנו
    password: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        sparse: true // מאפשר ל-email להיות ריק או ייחודי
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    level: {
        type: String,
        enum: ['חובבן', 'בינוני', 'מקצוען'],
        default: 'חובבן'
    },
    favoriteSport: {
        type: String,
        default: 'כדורגל'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);