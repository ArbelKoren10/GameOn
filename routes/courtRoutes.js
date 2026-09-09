const express = require('express');
const router = express.Router();
const courtController = require('../controllers/courtController');

router.post('/create', courtController.createCourt);
router.get('/', courtController.getAllCourts);
router.get('/search', courtController.searchCourts); // הנתיב הזה לפני ה-/:id
router.put('/:id', courtController.updateCourt);
router.delete('/:id', courtController.deleteCourt);

module.exports = router;