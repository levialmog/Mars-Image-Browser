const User = require("../models/user");

exports.getRegister = (req, res, next) => {
    res.render('register');
};

exports.postPassword = (req, res, next) => {
    res.render('password', {firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email});
};

exports.postSaveUser = (req, res, next) => {
    //TODO : check if email is not exist

    const user = new User(req.body.firstName.trim().toLowerCase(), req.body.lastName.trim().toLowerCase(), req.body.email.trim().toLowerCase(), req.body.password.trim());

    try {
        user.isValid();
    }
    catch (e) {
        console.log(e);
        //Todo: טיפול בחריגה של הולידציה
    }
    user.save();
    //Todo : save isRegistered in cookie: req.session.isRegistered = true;
    res.redirect("/");
};

exports.getIsUserExist = (req, res, next) => {
    let email = req.params.email.toLowerCase();
    res.json({isExist: User.isEmailExist(email)});
};
