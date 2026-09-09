const User = require('../models/user'); // ייבוא המודל שיצרנו

// פעולת Create - הוספת משתמש חדש
exports.createUser = async (req, res) => {
    try {
        // משיכת הנתונים מגוף הבקשה
        const { username, password, level, favoriteSport } = req.body;

        // יצירת מופע חדש של משתמש בזיכרון
        const newUser = new User({
            username,
            password, // הערה: בפרויקט אמיתי יש להצפין את הסיסמה לפני השמירה
            level,
            favoriteSport
        });

        // שמירת המשתמש במסד הנתונים
        const savedUser = await newUser.save();
        
        // החזרת תשובה חיובית ללקוח
        res.status(201).json(savedUser);

    } catch (error) {
        // טיפול בשגיאות כנדרש בהנחיות הפרויקט
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

// פעולת List - שליפת כל המשתמשים
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
         res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};
// פעולת Update - עדכון פרטי משתמש לפי ID
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params; // קבלת ה-ID מהנתיב
        const updateData = req.body; // קבלת הנתונים החדשים לעדכון

        // הפונקציה מוצאת את המשתמש לפי ה-ID ומעדכנת אותו. 
        // new: true אומר שהיא תחזיר את המסמך המעודכן, לא את הישן.
        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

// פעולת Delete - מחיקת משתמש לפי ID
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedUser = await User.findByIdAndDelete(id);
        
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

// פעולת Search - חיפוש משתמשים (לדוגמה, לפי רמת משחק)
exports.searchUsers = async (req, res) => {
    try {
        const { level } = req.query; // קבלת פרמטר החיפוש מה-Query String (למשל ?level=מקצוען)
        
        // יצירת אובייקט חיפוש ריק. נוסיף לו פרמטרים רק אם הם סופקו בבקשה
        let searchQuery = {};
        if (level) {
            searchQuery.level = level;
        }

        const users = await User.find(searchQuery);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error searching users', error: error.message });
    }
};