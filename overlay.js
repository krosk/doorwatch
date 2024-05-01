

function enterBlackScreen() {
    console.log('enter black screen');
    const element = document.querySelector("body");
    if (element.requestFullscreen) {  // for requestable elements
        element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {  // for non-standard webkit browsers
        element.webkitRequestFullscreen();
    } else if (element.webkitEnterFullscreen) {  // for non-standard webkit browsers
        element.webkitEnterFullscreen();
    } else {
        console.log('not found?');
    }
    document.getElementById("overlay").style.display = 'block';
};

function exitBlackScreen() {
    console.log('exit black screen');
    document.exitFullscreen();
    document.getElementById("overlay").style.display = 'none';
}

window.enterBlackScreen = enterBlackScreen;
window.exitBlackScreen = exitBlackScreen;