"use strict";

(function() {
    const serverError = "The server is not available right now, please try again later";
    const emailError = 'This email is already in use, please choose another one';

    document.addEventListener('DOMContentLoaded', function () {
        /**
         * Attach the submit button of the register form to a handler that validates the details received from
         * the user and if it is valid executes the submit of the form.
         */
        document.getElementById("registrationForm").addEventListener("submit", function (event) {
            event.preventDefault()
            document.getElementById("email").value = document.getElementById("email").value.trim();
            document.getElementById("firstName").value = document.getElementById("firstName").value.trim();
            document.getElementById("lastName").value = document.getElementById("lastName").value.trim();
            isExist(document.getElementById("email"));
        });

        /**
         * The function checks the status of the response received from the fetch.
         * @param response - the response received from the fetch.
         * @returns {Promise<never>|Promise<unknown>} - If the status of the response is valid then the function will return
         *                                             the response, and if it is not valid then it will return an error
         */
        function status(response) {
            if (response.status >= 200 && response.status < 300) {
                return Promise.resolve(response)
            } else {
                return Promise.reject(new Error(response.statusText))
            }
        }

        /**
         * The function sends to the server an API request to get check if the email received from the user is exist already in the database.
         * If so, returns an error message to the user, and if not, executes the submit of the form.
         * @param email - The email received from the user.
         */
        const isExist = function (email) {
            document.getElementById("loadingGif").classList.remove("d-none"); //starts the loading gif
            fetch(`/api/isUserExist/${email.value}`)
                .then(status)
                .then(function (response) {
                    return response.json();
                }).then(function (data) {
                if (data.isDbError) {
                    window.location.replace('/register/details');
                }
                if (!data.isExist) {
                    email.classList.remove("is-invalid");
                    document.getElementById("registrationForm").submit();
                } else {
                    email.nextElementSibling.innerHTML = emailError;
                    email.classList.add("is-invalid");
                }
                document.getElementById("loadingGif").classList.add("d-none"); //stops the loading gif
            })
                .catch(function (error) {
                    document.getElementById("loadingGif").classList.add("d-none"); //stops the loading gif
                    popUpModal("Error", `<p>${serverError}</p>`);
                });
        }

        /**
         * The function produces and activates a bootstrap modal according to the title and content sent to it
         * @param header - the wanted header content.
         * @param body - the wanted body content.
         */
        const popUpModal = function (header, body) {
            document.getElementById("ModalLabel").innerHTML = header;
            document.getElementById("modalBody").innerHTML = body;
            let myModal = new bootstrap.Modal(document.getElementById('modal'), {});
            myModal.show();
        }
    });
}) ();