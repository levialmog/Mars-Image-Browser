const User = require("../models/user");
const Cookies = require('cookies');
const keys = ['keyboard cat']

exports.getRegister = (req, res, next) => {
    res.render('register', {message: ""});
};

exports.postPassword = (req, res, next) => {
    const cookies = new Cookies(req, res, { keys: keys });

    const registrationStarted = cookies.get('RegistrationStarted', { signed: true })

    if (!registrationStarted) {
        cookies.set('RegistrationStarted', new Date().toISOString(), { signed: true, maxAge: 60*1000 });
    }

    res.render('password', {firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email});
};

exports.postSaveUser = (req, res, next) => {
    const cookies = new Cookies(req, res, { keys: keys });

    const registrationStarted = cookies.get('RegistrationStarted', { signed: true })

    if(!registrationStarted)
        res.render('register', {message: "Please complete the registration within a minute!"});
    else {
        const user = new User(req.body.firstName.trim().toLowerCase(), req.body.lastName.trim().toLowerCase(), req.body.email.trim().toLowerCase(), req.body.password.trim());

        try {
            user.isValid();
            if (User.isEmailExist(user.email)) {
                throw new Error("There is a user with the same email, please try again with another email");
            }
            user.save();
            res.redirect('/?isRegistered= true')
            //cookies.set('IsRegistered', new Date().toISOString(), { signed: true});
        } catch (e) {
            res.render('register', {message: e});
        }
    }
};

exports.getIsUserExist = (req, res, next) => {
    let email = req.params.email.toLowerCase();
    res.json({isExist: User.isEmailExist(email)});
};
