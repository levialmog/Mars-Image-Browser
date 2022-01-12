"use strict";

//private key for NASA api
const APIKEY = 'eT0Wm32cRHEMNwDhZGRtfeoevnTNnHrm9fCDtRWx';

const macrosModule = (function(){
    const NASAServerError = "NASA servers are not available right now, please try again later.";
    const imagesDeleteError = "For some reason, the images were not deleted.";
    const imageDeleteError = "For some reason, the image was not deleted.";
    const imageSavedError = "The image is already saved!";
    const serverError = "The server is not available right now, please try again later.";
    const inputRequired = "Input is required here";
    const dateRequired = "Please enter a SOL number or a valid date";
    const missionRequired = "The mission you've selected requires a";
    const serverProblem = "There is a problem, please try again.";

    return{
        NASAServerError : NASAServerError,
        imagesDeleteError : imagesDeleteError,
        imageDeleteError : imageDeleteError,
        imageSavedError : imageSavedError,
        serverError : serverError,
        inputRequired : inputRequired,
        dateRequired : dateRequired,
        missionRequired : missionRequired,
        serverProblem : serverProblem
    }
}) ();

/**
 *
 * @type {{validationDates: {Curiosity: {}, Opportunity: {}, Spirit: {}}, getValidationDates: getValidationDates, deleteImage: deleteImage, getSavedImageList: getSavedImageList, status: ((function(*=): (Promise<never>|Promise<*>))|*)}}
 */
const manifestModule = (function() {
    //An object that holds the dates of the missions that will be used for validation
    const validationDates = {'Curiosity' : {}, 'Opportunity' : {}, 'Spirit' : {}};

    /**
     * The function checks the status of the response received from the fetch.
     * @param response - the response received from the fetch.
     * @returns {Promise<never>|Promise<unknown>} - If the status of the response is valid then the function will return
     *                                             the response, and if it is not valid then it will return an error
     */
    function status(response) {
        if (response.status >= 200 && response.status <= 300) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(new Error(response.statusText))
        }
    }

    /**
     * The function gets the details of the wanted mission from the server.
     * @param mission - The mission we want to get its details.
     * @returns {Promise<{max_sol: *, max_date: *, landing_date: *}>} - the wanted details of the mission.
     */
    const fetchData = async (mission) => {
        try {
            let res = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${mission}?api_key=${APIKEY}`);
            await status(res);
            const data = await res.json();
            const {landing_date, max_date, max_sol} = data.photo_manifest;
            return {'landing_date' : landing_date, 'max_date' : max_date, 'max_sol' : max_sol};
        }
        catch (e){
            document.getElementById("activePart").innerHTML =  `<h3 class="text-center mt-2">${macrosModule.NASAServerError}</h3>`;
            document.getElementById("loadingGif1").classList.add("d-none"); //stops the loading gif
            document.getElementById("activePart").classList.remove("d-none");
            throw new Error();
        }
    }

    /**
     * The function calls for all three missions the fetchData function and inserts the information into the
     * validationDates data structure.
     */
    function getValidationDates() {
        document.getElementById("loadingGif1").classList.remove("d-none"); //starts the loading gif
        for (const mission in validationDates){
            fetchData(mission)
                .then((data)=> {
                    validationDates[mission] = data;
                    if(validationDates.Spirit.length !== 0) {
                        document.getElementById("loadingGif1").classList.add("d-none"); //stops the loading gif
                        document.getElementById("activePart").classList.remove("d-none");
                    }
                })
                .catch(function(e){
                    document.getElementById("loadingGif1").classList.add("d-none"); //stops the loading gif
                })
        }
    }

    function getSavedImageList() {
        document.getElementById("loadingGif2").classList.remove("d-none"); //stops the loading gif
        fetch('/api/savedImageList')
            .then(status)
            .then(function (response) {
                return response.json();
            }).then(function (images) {
            validationModule.checkServerError(images);
            for (let image of images) {
                document.getElementById("savedList").insertAdjacentHTML('beforeend', imageModule.toHtmlSaved(image));
                document.getElementById(`delete-btn${image.imageId}`).addEventListener('click', (event) => deleteImage(event, image));
                imageModule.getCarouselImage(image);
            }
            document.getElementById("loadingGif2").classList.add("d-none"); //stops the loading gif
            })
            .catch(function (error) {
                window.location.replace('/log/logout');
            });
    }

    const deleteImage = (event, image) => {
        document.getElementById("loadingGif2").classList.remove("d-none"); //starts the loading gif
        fetch(`/api/deleteImage/${image.imageId}`, {method:'DELETE'})
            .then(manifestModule.status)
            .then(function (response) {
                return response.json();
            }).then(function (data) {
            validationModule.checkServerError(data);
            if (data.isDeleted) {
                document.getElementById("savedList").removeChild(event.target.parentElement);
                document.getElementById(`carousel${image.imageId}`).remove();
            }
            else {
                validationModule.popUpModal("Error", `<p>${macrosModule.imageDeleteError}.</p>`);
            }
            document.getElementById("loadingGif2").classList.add("d-none"); //stops the loading gif

        })
            .catch(function (error) {
                document.getElementById("loadingGif2").classList.add("d-none"); //stops the loading gif
                validationModule.popUpModal("Error", `<p>${macrosModule.serverError}</p>`);
            });
    }

    return {
        status : status,
        getValidationDates : getValidationDates,
        getSavedImageList : getSavedImageList,
        deleteImage : deleteImage,
        validationDates : validationDates
    }
}) ();

/**
 * A validation module that returns functions that we use to perform validation during the program.
 * @type {{isDateOrSol: (function(*): {isValid: boolean, message: string, type: *}), isNotEmpty: (function(*): {isValid: boolean, message: string}), isInRange: (function(*): {isValid: boolean, message: string}), status: ((function(*=): (Promise<*>))|*)}}
 */
const validationModule = (function() {
    /**
     * The function checks whether the value of the element is valid - i.e. not empty.
     * @param element - The element whose value we want to test.
     * @returns {{isValid: boolean, message: string}} - Boolean which indicates if the value is valid, and an error
     *                                                  message in case it is not.
     */
    const isNotEmpty = function (element)  {
        return  {
            isValid: (element.value.length !== 0),
            message: macrosModule.inputRequired
        };
    }

    /**
     * The function checks whether the value of the element is valid - i.e. is the received input is in the valid date
     * or sol format and if so which one of them.
     * @param element - The element whose value we want to test.
     * @returns {{isValid: boolean, message: string, type: string}} - Boolean which indicates if the value is valid,
     *                                                                an error message in case it is not and the type of
     *                                                                the date.
     */
    const isDateOrSol = function (element)  {
        let v = false;
        let type;

        if(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(element.value)) {
            type = 'earth_date';
            v = true;

            let dateParts = element.value.split("-");
            let year = parseInt(dateParts[0], 10);
            let month = parseInt(dateParts[1], 10);
            let day = parseInt(dateParts[2], 10);

            let today = new Date();

            if (year < 0 || year > today.getFullYear() || month === 0 || month > 12)
                v = false;

            if(v) {
                let monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0))
                    monthLength[1] = 29;

                if(day <= 0 || day > monthLength[month - 1])
                    v = false;
            }
        }

        else if(/^[0-9]+$/.test(element.value)){
            type = 'sol';
            v = true;
        }

        return  {
            isValid: v,
            message: macrosModule.dateRequired,
            type : type
        };
    }

    /**
     * The function checks whether the value of the element is valid - i.e. the date is in the possible date range of
     * the mission.
     * @param element - The element whose value we want to test.
     * @returns {{isValid: boolean, message: string}} - Boolean which indicates if the value is valid, and an error
     *                                                  message in case it is not.
     */
    const isInRange = function (element) {
        let v = true;
        let limit;
        let limitDate;
        let maxValidationDate;
        let minValidationDate;

        if (element.type === 'earth_date') {
            element.type = 'date';
            maxValidationDate = manifestModule.validationDates[element.mission].max_date;
            minValidationDate = manifestModule.validationDates[element.mission].landing_date;
        } else if (element.type === 'sol') {
            maxValidationDate = manifestModule.validationDates[element.mission].max_sol;
            minValidationDate = "1";
        }

        if (element.date.value > maxValidationDate) {
            v = false;
            limit = 'before'
            limitDate = maxValidationDate;
        }

        if (element.date.value < minValidationDate) {
            v = false;
            limit = 'after'
            limitDate = minValidationDate;
        }

        return {
            isValid: v,
            message: `${macrosModule.missionRequired} ${element.type} ${limit} ${limitDate}`
        };
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

    const checkServerError = function (data) {
        if(data.isLoggedIn === false) {
            window.location.replace('/');
        }

        if(data.isDbError) {
            popUpModal("ERROR", `<p>${macrosModule.serverProblem}</p>`);
        }
    }

    return {
        isNotEmpty : isNotEmpty,
        isDateOrSol : isDateOrSol,
        isInRange : isInRange,
        popUpModal : popUpModal,
        checkServerError : checkServerError
    }
}) ();

/**
 * A model that returns classes related to representing images that will be used during the program
 * @type {{}} - returns the classes object.
 */
const imageModule = (function() {
    /**
     * The function creates a html card display for the image.
     * @returns {string} - A string that contains the html commands that build the image card display.
     */
    const toHtmlCard = function(image) {
        return `
            <div class="col-12 col-md-6 col-lg-4 mt-2">
                <div class="card">
                    <img src=${image.img_src} class="card-img-top p-1" alt="Mars">
                        <div class="card-body">
                            <p class="card-text">${image.earth_date}<br>
                                                 ${image.sol}<br>
                                                 ${image.camera.name}<br>
                                                 ${image.rover.name}</p>
                            <button class="save-btn btn btn-outline-secondary" id="save-btn${image.id}">Save</button>
                            <a href=${image.img_src} class="btn btn-secondary" target="_blank">Full size</a>
                        </div>
                </div>
            </div>`;
    }

    /**
     * The function creates a html "saved" display for the image.
     * @returns {string} - A string that contains the html commands that build the image "saved" display.
     */
    const toHtmlSaved = function (image) {
        return `
            <li><a href=${image.url} target="_blank">Image id: ${image.imageId}</a>
            <button type="button" class="btn btn-outline-danger" id="delete-btn${image.imageId}">X</button>
            <p>Earth Date: ${image.earthDate}, Sol: ${image.sol}, Camera: ${image.camera}</p></li>`
    }

    /**
     * The function creates a html carousel display for the image.
     * @param divClass - the class attributes of the current image in the carousel.
     * @returns {string} - A string that contains the html commands that build the image carousel display.
     */
    const toHtmlCarousel = function (divClass, image) {
        return `<div class="${divClass}" id="carousel${image.imageId}">
                        <img src=${image.url} class="d-block w-100" alt="Mars">
                        <div class="carousel-caption d-none d-md-block">
                            <h6>${image.camera}</h6>
                            <p>${image.earthDate}</p>
                            <a href=${image.url} class="btn btn-dark" target="_blank">Full size</a>
                        </div>
                    </div>`
    }

    /**
     * The function produces a carousel display of the last saved image.
     * @returns {string} - the carousel display of the last saved image.
     */
    function getCarouselImage(image) {
        let carouselInner = document.getElementById("carousel-inner");
        let divClass = (carouselInner.children.length === 0) ? "carousel-item active" : "carousel-item";
        carouselInner.insertAdjacentHTML('beforeend', toHtmlCarousel(divClass, image));
        document.getElementById("loadingGif2").classList.add("d-none"); //stops the loading gif
    }

    return {
        toHtmlCard : toHtmlCard,
        toHtmlSaved : toHtmlSaved,
        toHtmlCarousel : toHtmlCarousel,
        getCarouselImage : getCarouselImage,
    }
}) ();


(function() {
    /**
     * The function checks the user's input according to several requirements.
     * @param dateInput - The date the user entered.
     * @param missionInput - The mission the user chose.
     * @param cameraInput - The camera the user chose.
     * @returns {*|boolean|(*)[]} - a boolean indicates whether the input is valid and the type of date entered
     */
    const validateForm = (dateInput, missionInput, cameraInput) => {
        dateInput.value = dateInput.value.trim();
        missionInput.value = missionInput.value.trim();
        cameraInput.value = cameraInput.value.trim();
        let v1 = validateInput(dateInput, validationModule.isNotEmpty);
        let v2 = validateInput(missionInput, validationModule.isNotEmpty);
        let v3 = validateInput(cameraInput, validationModule.isNotEmpty);
        let v = v1.isValid && v2.isValid && v3.isValid;
        if(v) {
            let v4 = validateInput(dateInput, validationModule.isDateOrSol);
            v = v && v4.isValid;
            if(v4.isValid) {
                let v5 = validateInput({
                    'date': dateInput,
                    'type': v4.type,
                    'mission': missionInput.value
                }, validationModule.isInRange, true);
                v = v && v5.isValid;
            }
            return [v, v4.type];
        }
        return [v, undefined];
    }

    /**
     * The function checks whether the input element received is valid according to the received validation function
     * @param inputElement - The input element examined.
     * @param validateFunc - The function that will check the validity of the input.
     * @param isv5 - A boolean indicating whether the current test is the fifth one.
     * @returns {*}
     */
    const validateInput = (inputElement, validateFunc, isv5 = false) => {
        let errorElement = isv5 ? inputElement.date.nextElementSibling : inputElement.nextElementSibling;
        let v = validateFunc(inputElement); // call the validation function
        errorElement.innerHTML = v.isValid ? '' : v.message; // display the error message
        v.isValid ? (isv5 ? inputElement.date.classList.remove("is-invalid") : inputElement.classList.remove("is-invalid"))
                  : (isv5 ? inputElement.date.classList.add("is-invalid") : inputElement.classList.add("is-invalid"));
        return v;
    }

    /**
     * The function calls the fetchImages function, adds the pictures to the result list and creates the results display.
     * @param dateType - the type of date the user entered (earth date or sol).
     * @param dateInput - the date the user entered.
     * @param missionInput - The mission the user chose.
     * @param cameraInput - The camera the user chose.
     */
    function getImagesFromNASA(dateType, dateInput, missionInput, cameraInput) {
        document.getElementById("loadingGif2").classList.remove("d-none"); //starts the loading gif
        fetchImages(missionInput, dateType, dateInput, cameraInput)
            .then(response => {
                let isEmpty = true;
                for(let photo of response.photos) {
                    isEmpty = false;
                    document.getElementById("results").insertAdjacentHTML('beforeend', imageModule.toHtmlCard(photo));
                    document.getElementById(`save-btn${photo.id}`).addEventListener('click', (event) =>saveImage(event, photo));
                }
                if (isEmpty)
                    document.getElementById("results").innerHTML = `<h4 class="bg-danger bg-opacity-50 opacity-75 text-danger rounded p-2">No images found!</h4>`;

                document.getElementById("loadingGif2").classList.add("d-none"); //stops the loading gif
            })
    }

    /**
     * The function gets the wanted images from the server.
     * @param mission - The mission the user chose.
     * @param type - the type of date the user entered (earth date or sol).
     * @param time - the date the user entered.
     * @param camera - The camera the user chose.
     * @returns {Promise<any>}
     */
    const fetchImages = async (mission, type, time, camera) => {
        try {
            let res = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${mission}/photos?${type}=${time}&camera=${camera}&api_key=${APIKEY}`);
            await manifestModule.status(res);
            return await res.json();
        }
        catch (e){
            document.getElementById("loadingGif2").classList.add("d-none"); //stops the loading gif
            console.log(macrosModule.NASAServerError)
            validationModule.popUpModal("Error", `<p>${macrosModule.NASAServerError}</p>`);
        }
    }

    /**
     * The function initializes the form elements.
     * @param dateInput - the date input element.
     * @param missionInput - the date mission element.
     * @param cameraInput - the date camera element.
     */
    function initForm(dateInput, missionInput, cameraInput) {
        dateInput.value = "";
        missionInput.value = "choose";
        cameraInput.value = "choose";
    }

    /**
     * The function checks that the image has not been saved already, and if not saves it in the list of saved images.
     * @param image - the image that needs to be saved.
     */
    const saveImage = (event, image) => {
        let body = {imageId:image.id, url:image.img_src, earthDate:image.earth_date, sol:image.sol, camera:image.camera.name};

        let ajaxParams = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        };
        document.getElementById("loadingGif2").classList.remove("d-none"); //starts the loading gif
        fetch('/api/saveImage', ajaxParams)
            .then(manifestModule.status)
            .then(function (response) {
                return response.json();
            }).then(function (data) {
            validationModule.checkServerError(data);
            if (!data.isSaved) {
                validationModule.popUpModal("Information", `<p>${macrosModule.imageSavedError}</p>`);
            } else {
                document.getElementById("savedList").insertAdjacentHTML('beforeend', imageModule.toHtmlSaved(body));
                document.getElementById(`delete-btn${body.imageId}`).addEventListener('click', (event) => manifestModule.deleteImage(event, body));
                imageModule.getCarouselImage(body);
            }
            document.getElementById("loadingGif2").classList.add("d-none"); //stops the loading gif
        })
            .catch(function (error) {
                document.getElementById("loadingGif2").classList.add("d-none"); //stops the loading gif
                validationModule.popUpModal("Error", `<p>${macrosModule.serverError}</p>`)
            });
    }

    /**
     * The function clears the search results from the DOM, the resultList and the errors of the form.
     */
    function clearResults() {
        let results= document.getElementById("results");
        while (results.firstChild) {
            results.removeChild(results.firstChild);
        }
        for (let error of document.getElementsByClassName("invalid-feedback")) {
            error.innerHTML = "";
            error.previousElementSibling.classList.remove("is-invalid");
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        manifestModule.getValidationDates();
        manifestModule.getSavedImageList();


        let dateInput = document.getElementById('date');
        let missionInput = document.getElementById('mission');
        let cameraInput = document.getElementById('camera');

        /**
         * attach the button handlers (search, startSlideShow, stopSlideShow, clear, detailsModalBtn)
         */
        document.getElementById("search").addEventListener('click', () => {
            clearResults();
            let [isValid, dateType] = validateForm(dateInput, missionInput, cameraInput);
            if(isValid) {
                getImagesFromNASA(dateType, dateInput.value, missionInput.value, cameraInput.value);
                initForm(dateInput, missionInput, cameraInput);
            }
        });

        document.getElementById("startSlideShow").addEventListener('click', () => {
            document.getElementById("carouselPlace").classList.remove("d-none");
        });

        document.getElementById("stopSlideShow").addEventListener('click', () => {
            document.getElementById("carouselPlace").classList.add("d-none");
        });

        document.getElementById("deleteAll").addEventListener('click', () => {
            document.getElementById("loadingGif2").classList.remove("d-none"); //starts the loading gif
            fetch(`/api/savedImageLength`)
                .then(manifestModule.status)
                .then(function (response) {
                    return response.json();
                }).then(function (data) {
                validationModule.checkServerError(data);
                if (data.length > 0) {
                    fetch(`/api/deleteAll`, {method:'DELETE'})
                        .then(manifestModule.status)
                        .then(function (response) {
                            return response.json();
                        }).then(function (data) {
                        validationModule.checkServerError(data);
                        if(data.isDbError){
                            window.location.replace('/');
                        }
                        if (data.isDeleted) {
                            let savedList = document.getElementById("savedList");
                            while (savedList.firstChild)
                                savedList.removeChild(savedList.firstChild);
                            document.getElementById('carousel-inner').innerHTML = "";
                        }
                        else {
                            validationModule.popUpModal("Error", `<p>${macrosModule.imagesDeleteError}</p>`);
                        }
                        document.getElementById("loadingGif2").classList.add("d-none"); //stops the loading gif
                    })
                        .catch(function (error) {
                            document.getElementById("loadingGif2").classList.add("d-none"); //stops the loading gif
                            validationModule.popUpModal("Error", `<p>${macrosModule.serverError}</p>`);
                        });
                }
                document.getElementById("loadingGif2").classList.add("d-none"); //stops the loading gif
            })
                .catch(function (error) {
                    document.getElementById("loadingGif2").classList.add("d-none"); //stops the loading gif
                    validationModule.popUpModal("Error", `<p>${macrosModule.serverError}</p>`);
                });
        });

        document.getElementById("clear").addEventListener('click', () => {
            clearResults();
        });

        document.getElementById("logoutBtn").addEventListener('click', () => {
            document.getElementById("loadingGif2").classList.remove("d-none"); //stops the loading gif
            window.location.replace('/log/logout');
        });

        document.getElementById("detailsModalBtn").addEventListener('click', () =>{
            validationModule.popUpModal("Who we are", `<h4>Almog Levi & Lee Levi</h4>
                                                  <p>almogle@edu.hac.ac.il | leele@edu.hac.ac.il</p>`);
        });
    });
})();




