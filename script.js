'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
    #map;
    #mapEvent;
    constructor() {
        this.#getPosition();

        form.addEventListener('submit', this.#newWorkout.bind(this));
        inputType.addEventListener('change', this.#toggleElevationField);
    }

    #getPosition () {
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(this.#loadMap.bind(this), function () {
                alert('Could not get your position');
            });
    }

    #loadMap (position) {
        const { latitude, longitude } = position.coords;
        const coords = [latitude, longitude];

        this.#map = L.map('map').setView(coords, 15);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        // Handling click on map
        this.#map.on('click', this.#showForm.bind(this));
    }

    #showForm (mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    #toggleElevationField () {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    #newWorkout (event) {
        event.preventDefault();

        // Clear input fields
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

        // Display Marker
        const { lat, lng } = this.#mapEvent.latlng;
        L.marker([lat, lng])
            .addTo(this.#map)
            .bindPopup(L.popup({ maxWidth: 250, minWidth: 100, autoClose: false, closeOnClick: false, className: 'running-popup' }))
            .setPopupContent('Workout')
            .openPopup();
    }
}

const app = new App();