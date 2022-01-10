"use strict";

const APIKEY = 'eT0Wm32cRHEMNwDhZGRtfeoevnTNnHrm9fCDtRWx';

/**
 * A validation module that returns functions that we use to perform validation during the program.
 * @type {{isDateOrSol: (function(*): {isValid: boolean, message: string, type: *}), isNotEmpty: (function(*): {isValid: boolean, message: string}), isInRange: (function(*): {isValid: boolean, message: string}), status: ((function(*=): (Promise<*>))|*)}}
 */
const validationModule = (function() {
    //private key for NASA api

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
            document.getElementById("activePart").innerHTML =  `<h3 class="text-center mt-2">NASA servers are not available right now, please try again later.</h3>`;
        }
    }

    /**
     * The function calls for all three missions the fetchData function and inserts the information into the
     * validationDates data structure.
     */
    function getValidationDates() {
        document.getElementById("loadingGif1").classList.remove("d-none"); //starts the loading gif
        for (const mission in validationDates){
            fetchData(mission).then((data)=> {
                validationDates[mission] = data;
                if(validationDates.Spirit.length !== 0) {
                    document.getElementById("loadingGif1").classList.add("d-none"); //stops the loading gif
                    document.getElementById("activePart").classList.remove("d-none");
                }
            })
        }
    }

    /**
     * The function checks whether the value of the element is valid - i.e. not empty.
     * @param element - The element whose value we want to test.
     * @returns {{isValid: boolean, message: string}} - Boolean which indicates if the value is valid, and an error
     *                                                  message in case it is not.
     */
    const isNotEmpty = function (element)  {
        return  {
            isValid: (element.value.length !== 0),
            message: 'Input is required here'
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
            message: 'Please enter a SOL number or a valid date',
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
            maxValidationDate = validationDates[element.mission].max_date;
            minValidationDate = validationDates[element.mission].landing_date;
        } else if (element.type === 'sol') {
            maxValidationDate = validationDates[element.mission].max_sol;
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
            message: `The mission you've selected requires a ${element.type} ${limit} ${limitDate}`
        };
    }

    return{status : status,
           getValidationDates : getValidationDates,
           isNotEmpty : isNotEmpty,
           isDateOrSol : isDateOrSol,
           isInRange : isInRange}
}) ();

/**
 * A model that returns classes related to representing images that will be used during the program
 * @type {{}} - returns the classes object.
 */
const imageModule = (function() {
    //an object that holds all the classes of the module
    let classes = {};

    /**
     * A class that represents an image in the program. The object holds properties of the image.
     * @type {classes.Image}
     */
    classes.Image = class Image {
        constructor(date, sol, camera, mission, id, url) {
            this.date = date;
            this.sol = sol;
            this.camera = camera;
            this.mission = mission;
            this.id = id;
            this.url = url;
        }

        /**
         * The function creates a html card display for the image.
         * @returns {string} - A string that contains the html commands that build the image card display.
         */
        toHtmlCard() {
            return`
            <div class="col-12 col-md-6 col-lg-4 mt-2">
                <div class="card">
                    <img src=${this.url} class="card-img-top p-1" alt="Mars">
                        <div class="card-body">
                            <p class="card-text">${this.date}<br>
                                                 ${this.sol}<br>
                                                 ${this.camera}<br>
                                                 ${this.mission}</p>
                            <button class="save-btn btn btn-outline-secondary">Save</button>
                            <a href=${this.url} class="btn btn-secondary" target="_blank">Full size</a>
                        </div>
                </div>
            </div>`
        }

        /**
         * The function creates a html "saved" display for the image.
         * @returns {string} - A string that contains the html commands that build the image "saved" display.
         */
        toHtmlSaved() {
            return`
            <li><a href=${this.url} target="_blank">Image id: ${this.id}</a>
                <p>Earth Date: 2${this.date}, Sol: ${this.sol}, Camera: ${this.camera}</p></li>`
        }

        /**
         * The function creates a html carousel display for the image.
         * @param divClass - the class attributes of the current image in the carousel.
         * @returns {string} - A string that contains the html commands that build the image carousel display.
         */
        toHtmlCarousel(divClass){
            return `<div class="${divClass}">
                        <img src=${this.url} class="d-block w-100" alt="Mars">
                        <div class="carousel-caption d-none d-md-block">
                            <h6>${this.camera}</h6>
                            <p>${this.date}</p>
                            <a href=${this.url} class="btn btn-dark" target="_blank">Full size</a>
                        </div>
                    </div>`
        }
    }

    /**
     * A class that represents an image list in the program. The list hold Image type variables.
     * @type {classes.ImageList}
     */
    classes.ImageList = class {
        constructor() {
            this.list = [];
        }

        /**
         * The function adds an image to the list.
         * @param image - The image required to add to the list.
         */
        add(image) {
            this.list.push(image);
        }

        /**
         * The function searches the image list for a requested image by its url.
         * @param url - the url of the imaged that is looked for.
         * @returns {*} - the image that was found, or undefined if it wasn't found.
         */
        search(url) {
            return this.list.find((img) => img.url === url);
        }

        /**
         * The function clears the list.
         */
        clear() {
            this.list = [];
        }

        /**
         * The function returns the last element of the list.
         * @returns {*} - the last element of the list.
         */
        getLast() {
            return this.list[this.list.length-1];
        }

        /**
         * The function returns the length of the list.
         * @returns {number} - the length of the list.
         */
        getLength() {
            return this.list.length;
        }

        /**
         * The function creates a html search results display.
         * @returns {string} - A string that contains the html commands that build the images of the search results.
         */
        generateHTML() {
            let res = "";
            for (const img of this.list)
                res += img.toHtmlCard();
            return res;
        }
    }

    return classes;
}) ();


(function() {
    //Holds the image list of search results.
    let resultList = new imageModule.ImageList;

    //Holds the image list of saved images.
    let savedList = new imageModule.ImageList;

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
                for(let photo of response.photos) {
                    resultList.add(new imageModule.Image(photo.earth_date, photo.sol, cameraInput, missionInput, photo.id, photo.img_src));
                }
                if (resultList.getLength() === 0)
                    document.getElementById("results").innerHTML = `<h4 class="bg-danger bg-opacity-50 opacity-75 text-danger rounded p-2">No images found!</h4>`;
                else {
                    document.getElementById("results").innerHTML = resultList.generateHTML();
                    attachButtonListeners("save-btn", saveImage);
                }
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
            await validationModule.status(res);
            return await res.json();
        }
        catch (e){
            document.getElementById("loadingGif2").classList.add("d-none"); //stops the loading gif
            popUpModal("Error", `<p>NASA servers are not available right now, please try again later.</p>`);
        }
    }

    /**
     * The function attaches listeners to the buttons of the wanted class with the wanted function.
     * @param className - the wanted class name.
     * @param func - the wanted function.
     */
    function attachButtonListeners(className, func) {
        for (const b of document.getElementsByClassName(className)){
            b.addEventListener('click', func);}
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
     * The function produces and activates a bootstrap modal according to the title and content sent to it
     * @param header - the wanted header content.
     * @param body - the wanted body content.
     */
    function popUpModal(header, body) {
        document.getElementById("ModalLabel").innerHTML = header;
        document.getElementById("modalBody").innerHTML = body;
        let myModal = new bootstrap.Modal(document.getElementById('modal'), {});
        myModal.show();
    }

    /**
     * The function produces a carousel display of the last saved image.
     * @returns {string} - the carousel display of the last saved image.
     */
    function getCarouselImage() {
        let divClass = "carousel-item" + (savedList.getLength() === 1 ? " active" : "");
        return savedList.getLast().toHtmlCarousel(divClass);
    }

    /**
     * The function checks that the image has not been saved already, and if not saves it in the list of saved images.
     * @param image - the image that needs to be saved.
     */
    const saveImage = (image) => {
        if (savedList.search(image.target.parentElement.parentElement.firstElementChild.src) === undefined) {
            savedList.add(resultList.search(image.target.parentElement.parentElement.firstElementChild.src));
            appendSavedImage(savedList.getLast());
            document.getElementById("carousel-inner").insertAdjacentHTML('beforeend', getCarouselImage());
        }
        else {
            popUpModal("Information", `<p>The image is already saved!</p>`);
        }
    }

    /**
     * The function inserts the saved image into the HTML saved image display
     * @param image - the saved image.
     */
    const appendSavedImage =  (image) => {
        document.getElementById("savedList").insertAdjacentHTML('beforeend', image.toHtmlSaved());
    }

    /**
     * The function clears the search results from the DOM, the resultList and the errors of the form.
     */
    function clearResults() {
        resultList.clear();
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
        validationModule.getValidationDates();

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
            if(savedList.getLength() > 0)
                document.getElementById("carouselPlace").classList.remove("d-none");
        });

        document.getElementById("stopSlideShow").addEventListener('click', () => {
            document.getElementById("carouselPlace").classList.add("d-none");
        });

        document.getElementById("clear").addEventListener('click', () => {
            clearResults();
        });

        document.getElementById("detailsModalBtn").addEventListener('click', () =>{
            popUpModal("Who we are", `<h4>Almog Levi & Lee Levi</h4>
                                                  <p>almogle@edu.hac.ac.il | leele@edu.hac.ac.il</p>`);
        });
    });
})();




