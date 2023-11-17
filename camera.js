var LOGS_ID = 'logs';
// log overriding
console.log = function (message) {
    var logsDiv = document.getElementById(LOGS_ID);
    var logEntry = document.createElement('div');
    logEntry.textContent = message;
    logsDiv.appendChild(logEntry);

    // Optionally, scroll to the bottom to always show the latest logs
    logsDiv.scrollTop = logsDiv.scrollHeight;
};

window.onerror = function (message, source, lineno, colno, error) {
    var logsDiv = document.getElementById(LOGS_ID);
    var logEntry = document.createElement('div');
    logEntry.textContent = 'Error: ' + message + ' at line ' + lineno + ' column ' + colno;
    logsDiv.appendChild(logEntry);

    // Optionally, scroll to the bottom to always show the latest logs
    logsDiv.scrollTop = logsDiv.scrollHeight;

    // Prevent the default browser error handling
    return true;
};

// Accessing the back-facing camera
navigator.mediaDevices.getUserMedia({
    video: {
        facingMode: { exact: 'environment' } // or 'user' for front-facing camera
    }
})
    .then(function (stream) {
        var video = document.getElementById('video');
        video.srcObject = stream;
        video.play();
    })
    .catch(function (err) {
        console.log("Error: " + err);
    });

var video = document.getElementById('video');
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
var tracker = new tracking.Tracker('target');
document.body.appendChild(canvas);

tracking.track('#video', new tracking.ColorTracker(['magenta']));

tracking.ColorTracker.registerColor('magenta', function (r, g, b) {
    return r > 200 && g < 50 && b > 200;
});

tracking.track('#video', tracker);

tracker.on('track', function (event) {
    console.log('huh');
    
    context.clearRect(0, 0, canvas.width, canvas.height);

    event.data.forEach(function (rect) {
        context.strokeStyle = '#FF0000';
        context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    });
});

console.log('Done');