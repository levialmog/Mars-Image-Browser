"use strict";
const fs = require('fs');
const path = require('path');

module.exports = class User {
    constructor(firstName, lastName, email, password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
    }

    save() {
        userList.push(this);
    }

    isValid() {
        checkField(/[a-zA-z\s]+/.test(this.firstName), "First name should contain only letters and spaces!")
        checkField(/[a-zA-z\s]+/.test(this.lastName), "Last name should contain only letters and spaces!")
        checkField(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(this.email),
            "Valid email: name@example.com")
        checkField(/[\S]{8,}/.test(this.password), "The password must be at least 8 characters long and not contain spaces!")
    }
};

let userList = [];

module.exports.isEmailExist = function isEmailExist(email) {
    for(let user of userList){
        if(user.email === email)
            return true;
    }
    return false;
};

let checkField = (isValid, message) => {
    if(!isValid){
        throw new Error(message);
    }
};