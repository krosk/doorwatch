

function enterBlackScreen() {
    console.log('enter black screen');
    document.querySelector("body").requestFullscreen();
    document.getElementById("overlay").style.display = 'block';
};

function exitBlackScreen() {
    console.log('exit black screen');
    document.exitFullscreen();
    document.getElementById("overlay").style.display = 'none';
}

window.enterBlackScreen = enterBlackScreen;
window.exitBlackScreen = exitBlackScreen;