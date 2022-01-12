const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.get('/login', loginController.getLogin);
router.get('/logout', loginController.getLogout);

module.exports = router;