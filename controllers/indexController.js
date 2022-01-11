const db = require("../models");
exports.getHome = (req, res, next) => {
    if(!req.session.loggedIn) {
        res.redirect('/login')
    }
    else {
        res.render('index', {title:"Mars Image Browser", scriptSrc:"/js/indexFunc.js",
            firstName:req.session.firstName, lastName:req.session.lastName});
    }
};

exports.postHome = (req, res, next) => {
    if (req.body.email && req.body.password) {
        return db.User.findOne({where: {email: req.body.email.toLowerCase()}})
            .then((contact) => {
                if (!contact) {
                    req.session.message = "No account found with that email address!";
                    req.session.messageColor = "bg-danger"
                    res.redirect('/login');
                } else {
                    if (contact.password === req.body.password.toLowerCase()) {
                        req.session.loggedIn = true;
                        req.session.firstName = contact.firstName;
                        req.session.lastName = contact.lastName;
                        req.session.email = contact.email;
                        res.render('index', {title:"Mars Image Browser", scriptSrc:"/js/indexFunc.js",
                            firstName:req.session.firstName, lastName:req.session.lastName});
                    } else {
                        req.session.message = "Incorrect password!";
                        req.session.messageColor = "bg-danger"
                        res.redirect('/login');
                    }
                }
            })
            .catch((err) => {
                console.log('There was an error querying contacts', JSON.stringify(err))
                return res.send(err)
            });
    }
    else {
        req.session.message = "Please fill in all fields!";
        req.session.messageColor = "bg-danger"
        res.redirect('/login');
    }
};