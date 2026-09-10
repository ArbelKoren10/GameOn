const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: false }, // שונה ל-false כי למשתמשי גוגל אין סיסמה
    googleId: { type: String, required: false }  // שדה חדש לשמירת המזהה של גוגל
});

module.exports = mongoose.model('User', UserSchema);