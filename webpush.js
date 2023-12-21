// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-analytics.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-storage.js";
import { getToken } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-messaging.js";
import { getMessaging, onBackgroundMessage } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-messaging-sw.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { firebaseConfig } from "./config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

function requestToken() {
    console.log('requesting token');
    getToken(messaging, {vapidKey: "BAPdVq4JdFlWCMadSttRiVQP1Zf9cH5FAxJQc3nvLoUdYDTna4_pt7UeJ0zteKE3RKSOEtgVnsy9N4wUkpSUE2U"}).then((currentToken) => {
        if (currentToken) {
            console.log(currentToken);
            // Send the token to your server and update the UI if necessary
            // ...
        } else {
            // Show permission request UI
            console.log('No registration token available. Request permission to generate one.');
            // ...
        }
    }).catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
        // ...
    });
}

requestToken();

// Request notification permission
function requestNotificationPermission() {
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            console.log('Notification permission granted');
            setupFirebaseMessaging();
        } else {
            console.warn('Notification permission denied');
        }
    });
}

function setupFirebaseMessaging() {
    // Add logic to handle incoming push notifications
    onBackgroundMessage(messaging, (payload) => {
        console.log('Message received:', payload);
        const notificationTitle = 'Background Message Title';
        const notificationOptions = {
            body: 'Background Message body.',
            icon: '/firebase-logo.png'
        };
    });
}

window.requestNotificationPermission = requestNotificationPermission;
window.requestToken = requestToken;

console.log('Done');