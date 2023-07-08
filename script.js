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

class Workout {
    date = new Date();
    // id = (new Date() + '').slice(-10);
    id = this.randomId();

    constructor(coords, distance, duration) {
        this.coords = coords;       // [lat, lng]
        this.distance = distance;   // in Km
        this.duration = duration;   // in Minutes
    }

    // Generate random ID
    randomId (length = 10) {
        return Math.random().toString(36).substring(2, length + 2);
    }
}

//////////////////  RUNNING CLASS
class Running extends Workout {
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
    }

    calcPace () {
        // min/km
        this.pace = this.duration / this.distance;
        return this.pace;
    }

}

//////////////////  CYCLING CLASS
class Cycling extends Workout {
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.cadence = elevationGain;
        this.calcSpeed();
    }

    calcSpeed () {
        // km/h
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

//////////////////  OBJECT INSTANTIATION
// const running1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 524);

// console.log(running1, cycling1);


/////////////////////////////////////////////////
// APPLICATION ARCHITECTURE

class App {
    #map;
    #mapEvent;

    constructor() {
        this.#getPosition();

        form.addEventListener('submit', this.#newWorkout.bind(this));
        inputType.addEventListener('change', this.#toggleElevationField);
    }

    #getPosition () {
        // ACTUAL GEOLOCATION FEATURE
        // if (navigator.geolocation)
        //     navigator.geolocation.getCurrentPosition(this.#loadMap.bind(this), function () {
        //         alert('Could not get your position');
        //     });

        // FAKE GEOLOCATION
        this.#loadMap();
    }

    #loadMap (position) {
        // const { latitude, longitude } = position.coords;     // Enable for actual geolocation

        const latitude = 12.8791619;     // Delete when actual geolocation is enabled
        const longitude = 77.6916485;    // Delete when actual geolocation is enabled

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