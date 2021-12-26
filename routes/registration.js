const path = require('path');
const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');

router.get('/details', userController.getRegister);

router.post('/password', userController.postPassword);

router.post('/saveUser', userController.postSaveUser);

router.get('/isUserExist/:email', userController.getIsUserExist);

module.exports = router;