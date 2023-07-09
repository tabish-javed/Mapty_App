'use strict';

class Workout {
    date = new Date();
    // id = (new Date() + '').slice(-10);
    id = this.randomId();
    clicks = 0

    constructor(coords, distance, duration) {
        this.coords = coords;       // [lat, lng]
        this.distance = distance;   // in Km
        this.duration = duration;   // in Minutes
    }

    _setDescription () {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]}
        ${this.date.getDate()}`;
    }

    // Generate random ID
    randomId (length = 10) {
        return Math.random().toString(36).substring(2, length + 2);
    }

    click () {
        this.clicks++
    }
}

//////////////////  RUNNING CLASS
class Running extends Workout {
    type = 'running';
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
    }

    calcPace () {
        // min/km
        this.pace = this.duration / this.distance;
        return this.pace;
    }

}

//////////////////  CYCLING CLASS
class Cycling extends Workout {
    type = 'cycling';
    constructor(coords, distance, duration, elevation) {
        super(coords, distance, duration);
        this.elevation = elevation;
        this.calcSpeed();
        this._setDescription();
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

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
    #map;
    #mapZoomLevel = 15;
    #mapEvent;
    #workouts = [];

    constructor() {
        // Get user's position
        this.#getPosition();

        // Get data from local storage
        this.#getLocalStorage()

        // Attached event handlers
        form.addEventListener('submit', this.#newWorkout.bind(this));
        inputType.addEventListener('change', this.#toggleElevationField);
        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    }

    #getPosition () {
        // Enable to ACTUAL GEOLOCATION FEATURE
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(this.#loadMap.bind(this), function () {
                alert('Could not get your position');
            });

        // Enable to FAKE GEOLOCATION - While working on ethernet instead of WiFi
        // this.#loadMap();
    }

    #loadMap (position) {
        // Disable to FAKE GEOLOCATION - While working on ethernet instead of WiFi
        const { latitude, longitude } = position.coords;

        // Enable to FAKE GEOLOCATION - While working on ethernet instead of WiFi
        // const latitude = 12.8791619;     // Delete when actual geolocation is enabled
        // const longitude = 77.6916485;    // Delete when actual geolocation is enabled

        const coords = [latitude, longitude];
        this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        // Handling click on map
        this.#map.on('click', this.#showForm.bind(this));

        this.#workouts.forEach(workout => {
            this.#renderWorkoutMarker(workout)
        })
    }

    #showForm (mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    #hideForm () {
        // Empty inputs
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
        // Hide form
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => form.style.display = 'grid', 1000);
    }

    #toggleElevationField () {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    #newWorkout (event) {
        event.preventDefault();

        // Check if data is valid
        const validInput = (...inputs) => inputs.every(input => Number.isFinite(input));
        const isPositive = (...inputs) => inputs.every(input => input > 0);

        // get data from form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.#mapEvent.latlng;
        let workout;

        // If workout is running, create running object
        if (type === 'running') {
            const cadence = +inputCadence.value;
            // Check if data is valid
            if (!validInput(distance, duration, cadence) || !isPositive(distance, duration, cadence))
                return alert('Input have to be positive numbers!');

            workout = new Running([lat, lng], distance, duration, cadence);
        }

        // If workout is cycling, create cycling object
        if (type === 'cycling') {
            const elevation = +inputElevation.value;
            // Check if data is valid
            if (!validInput(distance, duration, elevation) || !isPositive(distance, duration))
                return alert('Input have to be positive numbers!');

            workout = new Cycling([lat, lng], distance, duration, elevation);
        }

        // Add new object to workout array
        this.#workouts.push(workout);
        console.log(workout);

        // Render workout on the map as marker
        this.#renderWorkoutMarker(workout);

        // Render workout on list
        this.#renderWorkout(workout);

        // Clear input and hide the form
        this.#hideForm();

        // Set local storage to all workouts
        this.#setLocalStorage()
    }

    #renderWorkoutMarker (workout) {
        L.marker(workout.coords)
            .addTo(this.#map)
            .bindPopup(L.popup({ maxWidth: 250, minWidth: 100, autoClose: false, closeOnClick: false, className: `${workout.type}-popup` }))
            .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
            .openPopup();
    }

    #renderWorkout (workout) {
        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
        `;

        if (workout.type === 'running')
            html += `
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.pace.toFixed(1)}</span>
                <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.cadence}</span>
                <span class="workout__unit">spm</span>
            </div>
        </li>
        `;

        if (workout.type === 'cycling')
            html += `
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.speed.toFixed(1)}</span>
                <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⛰</span>
                <span class="workout__value">${workout.elevation}</span>
                <span class="workout__unit">m</span>
            </div>
        </li>
        `;

        form.insertAdjacentHTML('afterend', html);
    }

    _moveToPopup (event) {
        const workoutElement = event.target.closest('.workout');
        // console.log(workoutElement);

        if (!workoutElement) return;
        const workout = this.#workouts.find(work => work.id === workoutElement.dataset.id);
        // console.log(workout.id);

        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1
            }
        });

        // Public Interface - Enable following two lines to start using Class-Workout's click method as public interface
        // workout.click()
        // console.log(workout.clicks);
    }

    #setLocalStorage () {
        localStorage.setItem('workouts', JSON.stringify(this.#workouts))
    }

    #getLocalStorage () {
        const data = JSON.parse(localStorage.getItem('workouts'))

        if (!data) return

        this.#workouts = data
        this.#workouts.forEach(workout => {
            this.#renderWorkout(workout)
            // this.#renderWorkoutMarker(workout)
        })
    }

    reset () {
        localStorage.removeItem('workouts')
        location.reload()
    }
}

const app = new App();