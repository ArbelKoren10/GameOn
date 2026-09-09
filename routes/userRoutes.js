const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // ייבוא הקונטרולר

// הגדרת נתיב ליצירת משתמש חדש (Create)
router.post('/create', userController.createUser);

// הגדרת נתיב לשליפת כל המשתמשים (List)
router.get('/', userController.getAllUsers);
// עדכון משתמש לפי ID (Update) - משתמשים בשיטת PUT
router.put('/:id', userController.updateUser);

// מחיקת משתמש לפי ID (Delete) - משתמשים בשיטת DELETE
router.delete('/:id', userController.deleteUser);

// חיפוש משתמשים (Search) - הנתיב הוא /search, לפני הפרמטרים
router.get('/search/users', userController.searchUsers);

module.exports = router;