const db = require("../models");
exports.getIsUserExist = (req, res, next) => {
    return db.User.findOne({where: {email: req.params.email}})
        .then((user) => {
            if(!user)
                res.send({isExist:false})
            else
                res.send({isExist:true})
        })
        .catch((err) => {
            console.log('There was an error querying contacts', JSON.stringify(err))
            return res.send(err)
        });
};

exports.getSavedImageLength = (req, res, next) => {
    return db.Image.count({where: {email: req.session.email}})
        .then((length) => {
                res.send({length:length});
        })
        .catch((err) => {
            console.log('There was an error querying contacts', JSON.stringify(err))
            return res.send(err)
        });
};

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
            console.log('There was an error querying images', JSON.stringify(err))
            return res.send(err)
        });
};

exports.getSavedImageList = (req, res, next) => {
    return db.Image.findAll({where: {email:req.session.email}})
        .then((images) => {
            res.send(images)
        })
        .catch((err) => {
            console.log('There was an error querying images', JSON.stringify(err))
            return res.send(err)
        });
};

exports.deleteImage = (req, res, next) => {
    return db.Image.destroy({where: {imageId:req.params.imageId, email:req.session.email}})
        .then((isDeleted) => {
            res.send({isDeleted:isDeleted});
        })
        .catch((err) => {
            console.log('There was an error querying images', JSON.stringify(err))
            return res.send(err)
        });
};

exports.deleteAll = (req, res, next) => {
    return db.Image.destroy({where: {email:req.session.email}})
        .then((isDeleted) => {
            res.send({isDeleted:isDeleted})
        })
        .catch((err) => {
            console.log('There was an error querying images', JSON.stringify(err))
            return res.send(err)
        });
};