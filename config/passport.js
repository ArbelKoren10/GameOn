const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user');

module.exports = function(passport) {
    // אסטרטגיית התחברות רגילה (מייל/שם משתמש וסיסמה)
    passport.use(new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
        try {
            // חיפוש המשתמש
            const user = await User.findOne({ username: username });
            if (!user) {
                return done(null, false, { message: 'משתמש לא נמצא' });
            }

            // בדיקת סיסמה (הנחה שהסיסמה הוצפנה בעת ההרשמה)
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'סיסמה שגויה' });
            }
        } catch (error) {
            return done(error);
        }
    }));

    // שמירת ה-ID של המשתמש בסשן
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // שליפת המשתמש מהמסד לפי ה-ID ששמור בסשן
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};