const playButton = document.querySelector("#playButton");
const sprintButton = document.querySelector("#sprintButton");
const title = document.querySelector("h1");
const runner = document.querySelector("#runner");
const timer = document.querySelector("#timer");

let position = 0;
let speed = 0;
let startTime;
let raceRunning = false;

playButton.addEventListener("click", function() {
    playButton.style.display = "none";

    let count = 3;
    title.textContent = count;

    const countdown = setInterval(function() {
        count--;

        if (count > 0) {
            title.textContent = count;
        } else {
            clearInterval(countdown);
            title.textContent = "GO!";
            startRace();
        }
    }, 1000);
});

function startRace() {
    raceRunning = true;
    startTime = performance.now();
    sprintButton.style.display = "block";
    gameLoop();
}

sprintButton.addEventListener("pointerdown", function() {
    if (!raceRunning) return;

    speed += 1.5;

    if (speed > 8) {
        speed = 8;
    }
});

function gameLoop() {
    if (!raceRunning) return;

    speed *= 0.97;

    position += speed;

    runner.style.left = position + "px";

    const elapsed = (performance.now() - startTime) / 1000;
    timer.textContent = elapsed.toFixed(2) + "s";

    if (position >= 700) {
        raceRunning = false;
        sprintButton.style.display = "none";
        title.textContent = "FINISH!";
        timer.textContent = elapsed.toFixed(2) + "s";
    } else {
        requestAnimationFrame(gameLoop);
    }
}
