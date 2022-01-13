"use strict";

(function() {
    const passwordError = 'The password confirmation does not match';

    document.addEventListener('DOMContentLoaded', function () {
        /**
         * Attach the submit button of the password form to a handler that validates the password received from
         * the user and if it is valid executes the submit of the form.
         */
        document.getElementById("passwordForm").addEventListener("submit", function (event) {
            event.preventDefault()

            let password = document.getElementById("password"),
                passwordConfirmation = document.getElementById("PasswordConfirmation");

            password.value = password.value.trim();
            passwordConfirmation.value = passwordConfirmation.value.trim();

            if (password.value === passwordConfirmation.value) {
                document.getElementById("passwordForm").submit();
            } else {
                passwordConfirmation.nextElementSibling.innerHTML = passwordError;
                passwordConfirmation.classList.add("is-invalid");
            }
        });
    });
}) ();