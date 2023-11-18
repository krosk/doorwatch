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

function initializeCamera(id) {
    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: { exact: 'environment' } // or 'user' for front-facing camera
        }
    })
    .then(function (stream) {
        var video = document.getElementById(id);
        video.srcObject = stream;
        video.play();
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
    var THRESHOLD = 50;
    
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
    
    initializeCamera(VIDEO_ID);
    
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    tracking.ColorTracker.registerColor('black', function(r, g, b) {
        if (r < 50 && g < 50 && b < 50) {
            return true;
        }
        return false;
    });
    //var tracker = new tracking.Tracker('target');
    //var tracker = new tracking.ColorTracker(['black']);
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
                    pixelData[offset] = pixelValue;      // Red
                    pixelData[offset + 1] = pixelValue;  // Green
                    pixelData[offset + 2] = pixelValue;  // Blue
                    pixelData[offset + 3] = 255;          // Alpha (opaque)
                }
                // Put the updated pixel data back onto the canvas
                context.putImageData(imageData, 0, 0);
                
                //context.strokeStyle = '#FF0000';
                //context.strokeRect(rect.x, rect.y, rect.width, rect.height);
                //console.log(rect.x, rect.y, rect.height, rect.width, rect.color);
                //console.log(pixelMask);
            });
        }
    });

    tracking.track(VIDEO_ID, tracker);

    console.log('Done');
};