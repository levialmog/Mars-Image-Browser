const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/userManagementController');

router.get('/details', userManagementController.getRegister);

router.post('/password', userManagementController.postPassword);

router.post('/saveUser', userManagementController.postSaveUser);

module.exports = router;