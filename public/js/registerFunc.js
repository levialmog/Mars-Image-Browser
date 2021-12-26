"use strict";

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("registrationForm").addEventListener("submit", function (event) {
        event.preventDefault()
        document.getElementById("email").value = document.getElementById("email").value.trim();
        document.getElementById("firstName").value = document.getElementById("firstName").value.trim();
        document.getElementById("lastName").value = document.getElementById("lastName").value.trim();
        isExist(document.getElementById("email"));
    });

    const isExist = function (email) {
        document.getElementById("loadingGif").classList.remove("d-none"); //starts the loading gif
        fetch(`/register/isUserExist/${email.value}`)
            .then(function (response) {
                return response.json();
            }).then(function (data) {
            if (!data.isExist) {
                email.classList.remove("is-invalid");
                document.getElementById("registrationForm").submit();
            } else {
                email.nextElementSibling.innerHTML = 'This email is already in use, please choose another one';
                email.classList.add("is-invalid");
            }
            document.getElementById("loadingGif").classList.add("d-none"); //stops the loading gif
        })
            .catch(function (error) {
                console.log(error);
            });
    }
});