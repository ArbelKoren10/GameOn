const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user');

// נתיב הרשמה
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'שם המשתמש כבר קיים במערכת' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        
        res.status(201).json({ message: 'נרשמת בהצלחה! כעת תוכל להתחבר.' });
    } catch (error) {
        res.status(500).json({ message: 'שגיאה בהרשמה', error: error.message });
    }
});

// נתיב התחברות
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(400).json({ message: info.message });
        
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.status(200).json({ message: 'התחברת בהצלחה!' });
        });
    })(req, res, next);
});

// נתיב התנתקות
router.post('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.status(200).json({ message: 'התנתקת בהצלחה' });
    });
});

// נתיב סטטוס
router.get('/status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ isGuest: false, user: { username: req.user.username } });
    } else {
        res.json({ isGuest: true });
    }
});

module.exports = router;