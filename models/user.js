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
        let isValid = true;

        isValid = isValid && (/[a-zA-z\s]+/.test(this.firstName));
        isValid = isValid && (/[a-zA-z\s]+/.test(this.lastName));
        isValid = isValid && (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(this.email));
        isValid = isValid && (/[\S]*/.test(this.password));

        if(!isValid){
            throw new Error('server side validation failed!');
        }
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

