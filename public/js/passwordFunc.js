"use strict";

document.addEventListener('DOMContentLoaded', function() {
    const passwordError = 'The password confirmation does not match';
    
    document.getElementById("passwordForm").addEventListener("submit", function (event) {
        event.preventDefault()

        let password = document.getElementById("password"),
            passwordConfirmation = document.getElementById("PasswordConfirmation");

        password.value = password.value.trim();
        passwordConfirmation.value = passwordConfirmation.value.trim();

        if (password.value === passwordConfirmation.value){
            document.getElementById("passwordForm").submit();
        }
        else{
            passwordConfirmation.nextElementSibling.innerHTML = passwordError;
            passwordConfirmation.classList.add("is-invalid");
        }
    });
});