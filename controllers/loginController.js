exports.getLogin = (req, res, next) => {
    let message, color;
    if (!req.session.message) {
        req.session.messageColor = "";
        req.session.message = "";
        message = "";
        color = "";
    }
    else {
        message = req.session.message;
        color = req.session.messageColor;
        req.session.messageColor = "";
        req.session.message = "";
    }

    if(!req.session.loggedIn) {
        req.session.loggedIn = false;
    }
    else{
        res.redirect('/')
    }

    res.render('login', {title:"Login", scriptSrc:"", message:message, messageColor:color});
};