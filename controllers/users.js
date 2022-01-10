const User = require("../modules/validationModule");
const Cookies = require('cookies');
const keys = ['keyboard cat']
const db = require('../models'); //contain the Contact model, which is accessible via db.Contact

exports.getRegister = (req, res, next) => {
    let message;
    if (!req.session.message) {
        req.session.message = "";
        message = "";
    }
    else {
        message = req.session.message;
        req.session.message = "";
    }

    res.render('register', {title:"Register", scriptSrc:"/js/registerFunc.js", message: message});
};

exports.postPassword = (req, res, next) => {
    const cookies = new Cookies(req, res, { keys: keys });
    const registrationStarted = cookies.get('RegistrationStarted', { signed: true })

    if (!registrationStarted) {
        cookies.set('RegistrationStarted', new Date().toISOString(), { signed: true, maxAge: 10*1000 });
    }

    res.render('password', {firstName:req.body.firstName,
                            lastName:req.body.lastName,
                            email:req.body.email,
                            title:"Register", scriptSrc:"/js/passwordFunc.js"});
};

exports.postSaveUser = (req, res, next) => {
    const cookies = new Cookies(req, res, { keys: keys });
    const registrationStarted = cookies.get('RegistrationStarted', { signed: true })

    if(!registrationStarted) {
        req.session.message = "Please complete the registration within a minute!";
        res.redirect('/register/details');
    }
    else {
        const [firstName, lastName, email, password] = [req.body.firstName.trim().toLowerCase(), req.body.lastName.trim().toLowerCase(), req.body.email.trim().toLowerCase(), req.body.password.trim()];

        try {
            User.isUserValid(firstName, lastName, email, password);
        } catch (e) {
            req.session.message = e.message;
            res.redirect('/register/details');
        }

        return db.Contact.findOne({where: {email: email}})
            .then((contacts) => {
                if (!contacts) {
                    return db.Contact.create({firstName, lastName, email, password})
                        .then((contact) => {
                            req.session.message = "You have successfully registered!";
                            res.redirect('/');
                        })
                        .catch((err) => {
                            console.log('There was an error creating a contact', JSON.stringify(contact))
                            return res.status(400).send(err)
                        })
                } else
                    throw new Error("There is a user with the same email, please try again with another email");
            })
            .catch((e) => {
                req.session.message = e.message;
                res.redirect('/register/details');
            });
    }
};