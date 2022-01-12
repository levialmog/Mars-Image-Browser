/**
 * The function checks if the user is logged in - if so, displays the login page, otherwise, redirects it to the route of the home page.
 * @param req
 * @param res
 * @param next
 */
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

/**
 * The function destroys the session and redirects to the landing page, thus implementing the logout from the site.
 * @param req
 * @param res
 * @param next
 */
exports.getLogout = (req, res, next) => {
    req.session.destroy();
    res.redirect('/');
};