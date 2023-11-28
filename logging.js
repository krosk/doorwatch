import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-analytics.js";

import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export function heartbeat() {
    setInterval(function() {
        if (window.performance && window.performance.memory) {
            console.log("Memory", Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024)), "MB");
        } else {
            console.log("Memory usage information not available");
        }
    }, 1000);
};

export function logToDiv() {
    var logsDiv = document.getElementById('logs');
    var logEntry = document.createElement('div');
    
    for (var i = 0; i < arguments.length; i++) {
        var message = arguments[i];
        logEntry.textContent += message + ' ';
        logEntry.textContent += '';
    }
    logsDiv.appendChild(logEntry);
    
    logEvent(analytics, 'log_message', {
        content: logEntry.textContent
    });

    // Optionally, scroll to the bottom to always show the latest logs
    logsDiv.scrollTop = logsDiv.scrollHeight;
};

export function logErrorToDiv(message, source, lineno, colno, error) {
    var logsDiv = document.getElementById('logs');
    var logEntry = document.createElement('div');
    logEntry.textContent = 'Error: ' + message + ' at line ' + lineno + ' column ' + colno;
    logsDiv.appendChild(logEntry);
    
    logEvent(analytics, 'log_error', {
        content: logEntry.textContent
    });

    // Optionally, scroll to the bottom to always show the latest logs
    logsDiv.scrollTop = logsDiv.scrollHeight;

    // Prevent the default browser error handling
    return true;
};

console.log = logToDiv;

window.onerror = logErrorToDiv;

window.heartbeat = heartbeat;