// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-storage.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { firebaseConfig } from "./config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app, firebaseConfig.storageBucket);

const INTERVAL_MS = 333;

let mediaRecorder, recorderEndTime, recorderChunks = [];

function initializeCamera(canvas, context, tracker) {
    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: { exact: 'environment' } // or 'user' for front-facing camera
        }
    })
    .then(function (stream) {
        const videoTrack = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(videoTrack.clone());
        
        setInterval(function() {
            //console.log(videoTrack.readyState, videoTrack.enabled);
            imageCapture.grabFrame().then(imageBitmap => {
                //console.log('Snapshot captured:', imageBitmap);
                context.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                tracker.track(imageData.data, canvas.width, canvas.height);
            })
            .catch((error) => console.log('Error capturing snapshot:', error));
        }, INTERVAL_MS);
        
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = function (event) {
            if (event.data.size > 0) {
                recorderChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = () => {
            const recordedBlob = new Blob(recorderChunks, { type: 'video/webm' });
            const recordedUrl = URL.createObjectURL(recordedBlob);
            recorderChunks = [];
        
            // Do something with the recorded video URL, e.g., display it or save it.
            console.log(recordedUrl);
            
            //downloadToDevice(recordedUrl);
            uploadToFirebase(recordedBlob);
        };
    })
    .catch(function (err) {
        console.log("Error: " + err);
    });
};

function generateFileName(addon) {
    const now = new Date();
    const dateString = now.toISOString().slice(0, 10); // Format: YYYY-MM-DD
    const timeString = now.toTimeString().slice(0, 8); // Format: HH:MM:SS
    const addonString = isNaN(addon) ? '0' : String(addon);
    const filename = `${dateString}/${timeString}-${addonString}.webm`;
    console.log(filename);
    return filename;
}

function downloadToDevice(recordedUrl) {
    const downloadLink = document.createElement('a');
    downloadLink.href = recordedUrl;
    downloadLink.download = generateFileName();
    document.body.appendChild(downloadLink);
    // auto download
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function uploadToFirebase(blob) {
    if (blob.size < 170000) {
        console.log('Empty video, skipping');
        return;
    }
    console.log('Upload start');
    // Create a storage reference
    var storageRef = ref(storage, 'video/' + generateFileName(blob.size));
    // Upload Blob
    // 'file' comes from the Blob or File API
    uploadBytes(storageRef, blob).then((snapshot) => {
        const blobSize = blob.size;
        console.log(`Uploaded a blob or file!`);
    });
}


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

// called every time there is a detection event
const startRecording = (durationMs) => {
    if (mediaRecorder && mediaRecorder.state != 'recording') {
        console.log('start');
        mediaRecorder.start();
    };
    // set, or extend the recorder end time
    recorderEndTime = Date.now() + durationMs;
};
    
const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state == 'recording') {
        console.log('stop');
        mediaRecorder.stop();
        //stream.getTracks().forEach(track => track.stop());
    };
};

const checkRecordingTime = () => {
    const currentTime = Date.now();
    if (currentTime >= recorderEndTime) {
        stopRecording();
    } else {
        requestAnimationFrame(checkRecordingTime);
    }
};
 
let previousPixels = null;

window.onload = function() {
    var THRESHOLD = 50;
    
    var DiffTracker = function() {
        DiffTracker.base(this, 'constructor');
    };
    tracking.inherits(DiffTracker, tracking.Tracker);
    DiffTracker.prototype.track = function(pixels, width, height) {
        if (previousPixels) {
            //console.log('Comparing');
            var rgbDiff = computeDifference(previousPixels, pixels);
            var arrMask = computeMask(rgbDiff, THRESHOLD);
            this.emit('track', { data : arrMask });
        }
        previousPixels = pixels;
    };
    
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    
    var tracker = new DiffTracker();
    
    initializeCamera(canvas, context, tracker);

    tracker.on('track', function (event) {
        if (event.data.length === 0 || event.data[0] == 0) {
            // No targets were detected in this frame.
            //console.log('No detection');
            context.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            //console.log('detect');
            startRecording(3000);
            checkRecordingTime();
            
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            event.data[1].forEach(function (pixelMask) {
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
    
    // Get current date and time
    var currentDate = new Date();
    
    // Extract individual components
    var hours = currentDate.getHours();
    var minutes = currentDate.getMinutes();
    var seconds = currentDate.getSeconds();
    
    // Display the time
    console.log('Time: ' + hours + ':' + minutes + ':' + seconds);
    
    var blackScreenButton = document.getElementById('blackscreen');
    blackScreenButton.click();
    
    setTimeout(function(){
        location.reload();
    }, 600000);
};
