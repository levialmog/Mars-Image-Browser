const db = require("../models");
const createError = require("http-errors");

const fillFields = "Please fill in all fields!";
const emailError = "No account found with that email address!"
const marsTitle = "Mars Image Browser"

/**
 * The landing page, if the user is not logged in, it redirects it to another login to the home page of the site.
 * @param req
 * @param res
 * @param next
 */
exports.getHome = (req, res, next) => {
    if(!req.session.loggedIn) {
        res.redirect('/log/login')
    }
    else {
        res.render('index', {title:marsTitle, scriptSrc:"/js/indexFunc.js",
            firstName:req.session.firstName, lastName:req.session.lastName});
    }
};

/**
 * A function that receives the login details that came from the login page, if they are correct -
 * directs the user to the home page of the site, otherwise - returns him to the login.
 * @param req
 * @param res
 * @param next
 * @returns {Promise<T>}
 */
exports.postHome = (req, res, next) => {
    if (req.body.email && req.body.password) {
        return db.User.findOne({where: {email: req.body.email.toLowerCase()}})
            .then((contact) => {
                if (!contact) {
                    req.session.message = emailError;
                    req.session.messageColor = "bg-danger"
                    res.redirect('/log/login');
                } else {
                    if (contact.password === req.body.password.toLowerCase()) {
                        req.session.loggedIn = true;
                        req.session.firstName = contact.firstName;
                        req.session.lastName = contact.lastName;
                        req.session.email = contact.email;
                        res.render('index', {title:marsTitle, scriptSrc:"/js/indexFunc.js",
                            firstName:req.session.firstName, lastName:req.session.lastName});
                    } else {
                        req.session.message = "Incorrect password!";
                        req.session.messageColor = "bg-danger"
                        res.redirect('/log/login');
                    }
                }
            })
            .catch((err) => {
                createError(404);
            });
    }
    else {
        req.session.message = fillFields;
        req.session.messageColor = "bg-danger"
        res.redirect('/log/login');
    }
};