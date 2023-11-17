// log overriding
var LOGS_ID = 'logs';

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
var VIDEO_ID = 'video';
navigator.mediaDevices.getUserMedia({
    video: {
        facingMode: { exact: 'user' } // or 'user' for front-facing camera
    }
})
    .then(function (stream) {
        var video = document.getElementById(VIDEO_ID);
        video.srcObject = stream;
        video.play();
    })
    .catch(function (err) {
        console.log("Error?: " + err);
    });

var video = document.getElementById(VIDEO_ID);
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
document.body.appendChild(canvas);

window.onload = function() {
    tracking.ColorTracker.registerColor('black', function(r, g, b) {
        //if (r < 50 && g > 200 && b < 50) {
        //    return true;
        //}
        return true;
    });
    //var tracker = new tracking.Tracker('target');
    var tracker = new tracking.ColorTracker(['black']);

    tracker.on('track', function (event) {
        if (event.data.length === 0) {
            // No targets were detected in this frame.
            //console.log('No detection');
        } else {
            console.log('detect');
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            event.data.forEach(function (rect) {
                //context.strokeStyle = '#FF0000';
                //context.strokeRect(rect.x, rect.y, rect.width, rect.height);
               // console.log(rect.x, rect.y, rect.height, rect.width, rect.color);
            });
        }
    });

    tracking.track('#video', tracker, { camera: true } );

    console.log('Done');
};