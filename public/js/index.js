/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { bookTour } from './stripe';
import { updateSettings } from './updateSettings';
import { displayMap } from './mapbox';
import { showAlert } from './alerts';

const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const mapBox = document.getElementById('map');

const accountForm = document.querySelector('.form-user-data');
const passwordForm = document.querySelector('.form-user-password');

const bookTourBtn = document.getElementById('book-tour');

const alertMessage = document.querySelector('body').dataset.alert;

if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', e => {
        logout();
    });
}

if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if (accountForm) {
    accountForm.addEventListener('submit', e => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', document.getElementById('name').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('photo', document.getElementById('photo').files[0]);

        updateSettings(formData, 'account');
    });
}

if (passwordForm) {
    passwordForm.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn-save-password').textContent = 'Updating...';

        const oldPassword = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings({ oldPassword, password, passwordConfirm }, 'password');

        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
        document.querySelector('.btn-save-password').textContent = 'Save password';
    });
}

if (bookTourBtn) {
    bookTourBtn.addEventListener('click', async e => {
        e.target.textContent = 'Processing...';
        const tourId = e.target.dataset.tourId;
        await bookTour(tourId);
    });
}

if (alertMessage) {
    showAlert('success', alertMessage, 20);
}
