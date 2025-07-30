const timerDisplay = document.querySelector('#timerDisplay');
const messageDisplay = document.querySelector('#messageDisplay');
const startButton = document.querySelector('#startButton');
const defuseButton = document.querySelector('#defuseButton');
const resetButton = document.querySelector('#resetButton');

//game state variables
let countdown = 10;
const initialCountdown = 10;
let bombIntervalid = null;
let explosionTimeoutId = null;

//web audio api variables
let audioContext;
let oscillator;
let gainNode;
let explosionSource;

function initAudioContext(){
    if(!audioContext){
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playTickSound(){
    if(!audioContext){
        return;
    }

    oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);

    gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function playExplosionSound(){
    if(!audioContext){
        return;
    }

    const bufferDuration = 0.5;
    const bufferSize = audioContext.sampleRate * bufferDuration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for(let i=0; i < bufferSize; i++){
        output[i] = Math.random() * 2 - 1;
    }

    explosionSource = audioContext.createBufferSource();
    explosionSource.buffer = buffer;

    const explosionGain = audioContext.createGain();
    explosionGain.gain.setValueAtTime(0.5, audioContext.currentTime);
    explosionGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + bufferDuration);
    
    explosionSource.connect(explosionGain);
    explosionGain.connect(audioContext.destination);

    explosionSource.start(audioContext.currentTime);
}

function tick(){
    countdown--;
    timerDisplay.textContent = countdown;
    playTickSound();

    if(countdown <= 0){
        clearInterval(bombIntervalid);
        bombIntervalid = null;
    }
}

function explode(){
    if(bombIntervalid){
        clearInterval(bombIntervalid);
        bombIntervalid = null;
    }

    timerDisplay.textContent = "0";
    timerDisplay.style.color = "#E53E3E";
    messageDisplay.textContent = "Boom! You failed!";
    messageDisplay.style.color = "#E53E3E";
    playExplosionSound();
    disabledButtons(true, true, false);
}

function startBomb(){
    initAudioContext();

    if(bombIntervalid !== null || explosionTimeoutId !== null){
        messageDisplay.textContent = "Bomb is already active or needs reset!";
        messageDisplay.style.color = "#ECC94B";
    }

    countdown = initialCountdown;
    timerDisplay.textContent = countdown;
    timerDisplay.style.color = "#fc8181";
    messageDisplay.textContent = "Ticking...";
    messageDisplay.style.color = "#CBD5E0";

    bombIntervalid = setInterval(tick, 1000);
    explosionTimeoutId = setTimeout(explode, initialCountdown * 1000);
    disabledButtons(true, false, false);
}

function defuseBomb(){
    if(bombIntervalid){
        clearInterval(bombIntervalid);
        bombIntervalid = null;
    }

    if(explosionTimeoutId){
        clearTimeout(explosionTimeoutId);
        explosionTimeoutId = null;
    }

    timerDisplay.textContent = "SAFE";
    timerDisplay.style.color = "#48BB78";
    messageDisplay.textContent = "Bomb Defused! Phew!";
    messageDisplay.style.color = "#48BB78";
    disabledButtons(true, true, false);
}

function resetGame(){
    if(bombIntervalid){
        clearInterval(bombIntervalid);
        bombIntervalid = null;
    }

    if(explosionTimeoutId){
        clearTimeout(explosionTimeoutId);
        explosionTimeoutId = null;
    }

    countdown = initialCountdown;
    timerDisplay.textContent = countdown;
    timerDisplay.style.color = "#FC8181";
    messageDisplay.textContent = "Press 'Start Bomb' to begin!";
    messageDisplay.style.color = "#CBD5E0";
    disabledButtons(false, true, true);
}

function disabledButtons(startDisabled, defuseDisabled, resetDisabled){
    startButton.disabled = startDisabled;
    defuseButton.disabled = defuseDisabled;
    resetButton.disabled = resetDisabled;
}

startButton.addEventListener('click', startBomb);
defuseButton.addEventListener('click', defuseBomb);
resetButton.addEventListener('click', resetGame);

window.onload = () => {
    disabledButtons(false, true, true);
};