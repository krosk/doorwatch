// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-analytics.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-storage.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { firebaseConfig } from "./config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app, firebaseConfig.storageBucket);

let mediaRecorder, recorderEndTime, recorderChunks = [];

function initializeCamera(video, canvas) {
    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: { exact: 'environment' } // or 'user' for front-facing camera
        }
    })
    .then(function (stream) {
        video.srcObject = stream;
        video.play();
        
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

function generateFileName() {
    const now = new Date();
    const dateString = now.toISOString().slice(0, 10); // Format: YYYY-MM-DD
    const timeString = now.toTimeString().slice(0, 8); // Format: HH:MM:SS
    return `${dateString}-${timeString}.webm`;
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
    console.log('Upload start');
    // Create a storage reference
    var storageRef = ref(storage, 'video/' + generateFileName());
    // Upload Blob
    // 'file' comes from the Blob or File API
    uploadBytes(storageRef, blob).then((snapshot) => {
        console.log('Uploaded a blob or file!');
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

const startRecording = (durationMs) => {
    if (mediaRecorder && mediaRecorder.state != 'recording') {
        console.log('start');
        mediaRecorder.start();
    };
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
            this.emit('track', { data : arrMask });
        }
        previousPixels = pixels;
    };
    
    var video = document.getElementById(VIDEO_ID);
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    
    initializeCamera(video, canvas);

    var tracker = new DiffTracker();

    tracker.on('track', function (event) {
        if (event.data.length === 0 || event.data[0] == 0) {
            // No targets were detected in this frame.
            //console.log('No detection');
        } else {
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

    tracking.track(VIDEO_ID, tracker);

    console.log('Done');
};