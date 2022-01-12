const express = require('express');
const router = express.Router();
const userManagementController = require('../controllers/userManagementController');
const apiController = require("../controllers/apiController");

router.use(userManagementController.useProtectedPages);
router.get('/details', userManagementController.getRegister);
router.post('/password', userManagementController.postPassword);
router.get('/password', userManagementController.getPassword);
router.post('/saveUser', userManagementController.postSaveUser);
router.get('/saveUser', userManagementController.getSaveUser);

module.exports = router;