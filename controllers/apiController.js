const db = require("../models");

/**
 * A function that checks if the user exists in a database.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<T | *>}
 */
exports.getIsUserExist = (req, res, next) => {
    return db.User.findOne({where: {email: req.params.email}})
        .then((user) => {
            if(!user)
                res.send({isExist:false})
            else
                res.send({isExist:true})
        })
        .catch((err) => {
            return res.send({isDbError : true})
        });
};

/**
 *A function that receives all referrals to all the routes below it and protects them from non-logged-in user referrals.
 * @param req
 * @param res
 * @param next
 */
exports.useProtectedPages = (req, res, next) => {
    if(req.session.loggedIn){
        next()
    }
    else{
        res.send({isLoggedIn : false});
    }
};

/**
 * A function that checks the length of the database that saves the favorite images for the user.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<T | *>}
 */
exports.getSavedImageLength = (req, res, next) => {
    return db.Image.count({where: {email: req.session.email}})
        .then((length) => {
                res.send({length:length});
        })
        .catch((err) => {
            return res.send({isDbError : true})
        });
};

/**
 * A function that checks whether the requested image is already stored in the database.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<[Model, boolean] | *>}
 */
exports.postSaveImage = (req, res, next) => {
    const {imageId, url, earthDate, sol, camera} = req.body;
    const email = req.session.email;
    return db.Image.findOrCreate({where: {imageId, url, earthDate, sol, camera, email}})
        .then(([image, isCreated]) => {
            if(isCreated) {
                res.send({isSaved:true})
            }
            else
                res.send({isSaved:false})
        })
        .catch((err) => {
            return res.send({isDbError : true})
        });
};

/**
 * A function that returns the database of the favorite images.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<Model[] | *>}
 */
exports.getSavedImageList = (req, res, next) => {
    return db.Image.findAll({where: {email:req.session.email}})
        .then((images) => {
            res.send(images)
        })
        .catch((err) => {
            return res.send({isDbError : true});
        });
};

/**
 * Function responsible for handling the unique delete button for a saved favorite image
 * @param req
 * @param res
 * @param next
 * @returns {Promise<T | *>}
 */
exports.deleteImage = (req, res, next) => {
    return db.Image.destroy({where: {imageId:req.params.imageId, email:req.session.email}})
        .then((isDeleted) => {
            res.send({isDeleted:isDeleted});
        })
        .catch((err) => {
            return res.send({isDbError : true})
        });
};

/**
 * Function responsible for handling the delete button of all the favorite images stored in the database.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<T | *>}
 */
exports.deleteAll = (req, res, next) => {
    return db.Image.destroy({where: {email:req.session.email}})
        .then((isDeleted) => {
            res.send({isDeleted:isDeleted})
        })
        .catch((err) => {
            return res.send({isDbError : true})
        });
};