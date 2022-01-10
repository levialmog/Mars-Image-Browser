"use strict";

let checkField = (isValid, message) => {
    if(!isValid){
        throw new Error(message);
    }
};

module.exports.isUserValid = function isUserValid(firstName, lastName, email, password) {
    checkField(/^[a-zA-z\s]+$/.test(firstName), "First name should contain only letters and spaces!")
    checkField(/^[a-zA-z\s]+$/.test(lastName), "Last name should contain only letters and spaces!")
    checkField(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email),
        "Valid email: name@example.com")
    checkField(/[\S]{8,}/.test(password), "The password must be at least 8 characters long and not contain spaces!")
};
