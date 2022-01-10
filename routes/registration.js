const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');

router.get('/details', userController.getRegister);

router.post('/password', userController.postPassword);

router.post('/saveUser', userController.postSaveUser);

module.exports = router;