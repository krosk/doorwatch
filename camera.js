// log overriding
var LOGS_ID = 'logs';

console.log = function () {
    var logsDiv = document.getElementById(LOGS_ID);
    var logEntry = document.createElement('div');
    
    for (var i = 0; i < arguments.length; i++) {
        var message = arguments[i];
        logEntry.textContent += message + ' ';
    }
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

function initializeCamera(video, canvas) {
    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: { exact: 'environment' } // or 'user' for front-facing camera
        }
    })
    .then(function (stream) {
        video.srcObject = stream;
        video.play();
        
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        
        const { width, height } = settings;
        const aspectRatio = width / height;
        
        // Adjust canvas size based on camera feed aspect ratio
        //canvas.width = 100;
        //canvas.height = 100;
    })
    .catch(function (err) {
        console.log("Error: " + err);
    });
};

function computeDifference(rgb1, rgb2) {
    if (rgb1.length !== rgb2.length) {
        throw new Error("Arrays must have the same size");
    }

    const rgb = new Int32Array(rgb1.length);

    for (let i = 0; i < rgb1.length; i++) {
        rgb[i] = Math.abs(rgb1[i] - rgb2[i]);
    }

    return rgb;
}

function computeMask(rgb, threshold) {
    const size = rgb.length / 4;
    const arr = new Int32Array(size);
    
    var count = 0;
    
    for (let i = 0; i < size; i++) {
        if (rgb[i*4] > threshold) {
            count += 1;
            arr[i] = 1;
        } else {
            arr[0];
        }
    }
    
    return [count, [arr]];
}

var previousPixels = null;

window.onload = function() {
    var VIDEO_ID = 'video';
    var THRESHOLD = 20;
    
    var DiffTracker = function() {
        DiffTracker.base(this, 'constructor');
    };
    tracking.inherits(DiffTracker, tracking.Tracker);
    DiffTracker.prototype.track = function(pixels, width, height) {
        if (previousPixels) {
            var rgbDiff = computeDifference(previousPixels, pixels);
            var arrMask = computeMask(rgbDiff, THRESHOLD);
            if (arrMask[0] > 0) {
                this.emit('track', { data : arrMask[1] });
            };
        }
        previousPixels = pixels;
    };
    
    var video = document.getElementById(VIDEO_ID);
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    
    initializeCamera(video, canvas);

    var tracker = new DiffTracker();

    tracker.on('track', function (event) {
        if (event.data.length === 0) {
            // No targets were detected in this frame.
            //console.log('No detection');
        } else {
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            event.data.forEach(function (pixelMask) {
                // Access the pixel data directly from the canvas context
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const pixelData = imageData.data;
                
                // Modify pixel values based on your Int32Array
                for (let i = 0; i < pixelMask.length; i++) {
                    const pixelValue = pixelMask[i] === 1 ? 255 : 0;
                
                    // Update red, green, blue, and alpha values for the pixel directly
                    const offset = i * 4;
                    pixelData[offset] = pixelValue;
                    pixelData[offset + 1] = 0;
                    pixelData[offset + 2] = 0;
                    pixelData[offset + 3] = pixelValue != 0 ? 255 : 0;
                }
                // Put the updated pixel data back onto the canvas
                context.putImageData(imageData, 0, 0);
            });
        }
    });

    tracking.track(VIDEO_ID, tracker);

    console.log('Done');
};