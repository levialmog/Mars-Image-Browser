const ValidationModule = require("../modules/validationModule");
const Cookies = require('cookies');
const keys = ['keyboard cat']
const db = require('../models'); //contain the Contact model, which is accessible via db.Contact
const emailError = "There is a user with the same email, please try again with another email"
const timeError = "Please complete the registration within a minute!"
const regSuccess = "You have successfully registered!"

/**
 * A function that receives all referrals to all the routes below it and protects them from non-logged-in user referrals.
 * @param req
 * @param res
 * @param next
 */
exports.useProtectedPages = (req, res, next) => {
    if(!req.session.loggedIn){
        next()
    }
    else{
        req.method = "GET";
        res.redirect('/');
    }
};

/**
 * The function displays the registration page.
 * @param req
 * @param res
 * @param next
 */
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

/**
 * The function activates a one-minute timer to complete the registration, receives and transfers the first registration
 * details to the password form and displays the password form page.
 * @param req
 * @param res
 * @param next
 */
exports.postPassword = (req, res, next) => {
    const cookies = new Cookies(req, res, { keys: keys });
    const registrationStarted = cookies.get('RegistrationStarted', { signed: true })

    if (!registrationStarted) {
        cookies.set('RegistrationStarted', new Date().toISOString(), { signed: true, maxAge: 60*1000 });
    }

    res.render('password', {firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        title:"Register", scriptSrc:"/js/passwordFunc.js"});
};

/**
 * The function redirects to the landing page and thus protects the password form.
 * @param req
 * @param res
 * @param next
 */
exports.getPassword = (req, res, next) => {
    res.redirect('/');
}

/**
 * The function validates the registration details and if they are valid saves the user in the database.
 * If not, redirects back to registration. Then redirects to login.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<[Model, boolean]>}
 */
exports.postSaveUser = (req, res, next) => {
    const cookies = new Cookies(req, res, { keys: keys });
    const registrationStarted = cookies.get('RegistrationStarted', { signed: true })

    if(!registrationStarted) {
        req.session.message = timeError;
        res.redirect('/register/details');
    }
    else {
        const [firstName, lastName, email, password] = [req.body.firstName.trim().toLowerCase(), req.body.lastName.trim().toLowerCase(), req.body.email.trim().toLowerCase(), req.body.password.trim()];

        try {
            ValidationModule.isUserValid(firstName, lastName, email, password);
        } catch (e) {
            req.session.message = e.message;
            res.redirect('/register/details');
        }

        return db.User.findOrCreate({where: {firstName, lastName, email, password}})
            .then(([user, isCreated]) => {
                if (isCreated) {
                    req.session.message = regSuccess;
                    req.session.messageColor = "bg-success"
                    res.redirect('/log/login');
                }
                else
                    throw new Error(emailError);
            })
            .catch((e) => {
                req.session.message = e.message;
                res.redirect('/register/details');
            });
    }
};
/**
 * The function redirects to the landing page and thus protects the data structure from unsupervised user saving.
 * @param req
 * @param res
 * @param next
 */
exports.getSaveUser = (req, res, next) => {
    res.redirect('/');
}