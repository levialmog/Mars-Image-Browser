const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.get('/isUserExist/:email', apiController.getIsUserExist);
router.use(apiController.useProtectedPages);
router.get('/savedImageLength', apiController.getSavedImageLength);
router.post('/saveImage', apiController.postSaveImage);
router.get('/savedImageList', apiController.getSavedImageList);
router.delete('/deleteImage/:imageId', apiController.deleteImage);
router.delete('/deleteAll', apiController.deleteAll);

module.exports = router;