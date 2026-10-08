const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const leftButton = document.getElementById("left");
const rightButton = document.getElementById("right");
const message = document.getElementById("message");
const timerText = document.getElementById("time");
const distanceText = document.getElementById("distance");

let W = 0;
let H = 0;
let dpr = 1;

let state = "menu";
let countdown = 3;

let distance = 0;
let speed = 0;
let maxSpeed = 8;
let raceStart = 0;
let finalTime = 0;

let lastInput = "";
let stride = 0;
let runnerBob = 0;

let crowdOffset = 0;
let trackOffset = 0;

function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width = W * dpr;
    canvas.height = H * dpr;

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resize);
resize();

function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, H * .55);
    sky.addColorStop(0, "#111a35");
    sky.addColorStop(1, "#435b75");

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    drawStadium();
    drawTrack();
}

function drawStadium() {
    const standTop = H * .12;
    const standBottom = H * .48;

    ctx.fillStyle = "#20242b";
    ctx.fillRect(0, standTop, W, standBottom - standTop);

    for (let row = 0; row < 5; row++) {
        const y = standTop + row * 42;

        ctx.fillStyle = row % 2 === 0 ? "#30353d" : "#252a31";
        ctx.fillRect(0, y, W, 42);

        for (let x = -40; x < W + 40; x += 34) {
            const movingX = x + ((crowdOffset + row * 15) % 34);

            const headY = y + 10;

            ctx.beginPath();
            ctx.arc(movingX, headY, 5, 0, Math.PI * 2);
            ctx.fillStyle = "#d8b28b";
            ctx.fill();

            ctx.fillStyle = row % 3 === 0 ? "#c84b45" : "#4774a8";

            ctx.fillRect(
                movingX - 7,
                headY + 7,
                14,
                20
            );

            if ((x + row) % 3 === 0) {
                ctx.strokeStyle = "#ddd";
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.moveTo(movingX - 8, headY + 10);
                ctx.lineTo(movingX - 15, headY + 2);
                ctx.stroke();
            }
        }
    }

    ctx.fillStyle = "#16191e";
    ctx.fillRect(0, standBottom, W, 25);

    ctx.fillStyle = "#d8d8d8";
    ctx.fillRect(W * .08, standTop - 25, 8, 35);
    ctx.fillRect(W * .92, standTop - 25, 8, 35);
}

function drawTrack() {
    const horizon = H * .49;

    ctx.fillStyle = "#8c3030";

    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(W, horizon);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    const laneCount = 8;

    for (let i = 0; i <= laneCount; i++) {
        const bottomX = (W / laneCount) * i;

        ctx.strokeStyle = "rgba(255,255,255,.8)";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(W / 2, horizon);
        ctx.lineTo(bottomX, H);
        ctx.stroke();
    }

    const stripes = 12;

    for (let i = 0; i < stripes; i++) {
        const y =
            horizon +
            ((i * 90 + trackOffset) % (H - horizon));

        const perspective =
            (y - horizon) / (H - horizon);

        ctx.strokeStyle = "rgba(255,255,255,.65)";
        ctx.lineWidth = 2 + perspective * 3;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
    }

    ctx.fillStyle = "#eee";
    ctx.fillRect(W * .04, horizon + 5, W * .92, 4);
}

function drawRunner() {
    const x = W * .32;
    const ground = H * .70;

    const bob = Math.sin(stride) * runnerBob;

    const bodyY = ground - 90 + bob;

    ctx.save();

    ctx.translate(x, bodyY);

    const swing = Math.sin(stride);
    const opposite = Math.sin(stride + Math.PI);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.strokeStyle = "#111";
    ctx.lineWidth = 11;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 48);
    ctx.stroke();

    ctx.lineWidth = 8;

    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(-30 * swing, 35);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(30 * opposite, 35);
    ctx.stroke();

    ctx.lineWidth = 9;

    ctx.beginPath();
    ctx.moveTo(-5, 45);
    ctx.lineTo(
        -25 + 40 * swing,
        78
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(5, 45);
    ctx.lineTo(
        25 + 40 * opposite,
        78
    );
    ctx.stroke();

    ctx.lineWidth = 6;

    ctx.beginPath();
    ctx.moveTo(
        -25 + 40 * swing,
        78
    );
    ctx.lineTo(
        -48 + 45 * swing,
        78
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(
        25 + 40 * opposite,
        78
    );
    ctx.lineTo(
        48 + 45 * opposite,
        78
    );
    ctx.stroke();

    ctx.fillStyle = "#c68b67";
    ctx.beginPath();
    ctx.arc(0, -18, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#151515";
    ctx.beginPath();
    ctx.arc(-2, -23, 13, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#e7e7e7";
    ctx.fillRect(-7, 0, 14, 35);

    ctx.fillStyle = "#d73838";
    ctx.fillRect(-7, 30, 14, 25);

    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, W, H);

    drawBackground();

    if (state !== "menu") {
        drawRunner();
    }

    crowdOffset += speed * .6;
    trackOffset += speed * 1.5;

    requestAnimationFrame(draw);
}

draw();

function startGame() {
    state = "countdown";
    countdown = 3;

    message.textContent = "3";
    timerText.textContent = "0.00";
    distanceText.textContent = "100m";

    setTimeout(() => {
        countdown = 2;
        message.textContent = "2";
    }, 1000);

    setTimeout(() => {
        countdown = 1;
        message.textContent = "1";
    }, 2000);

    setTimeout(() => {
        state = "race";
        message.textContent = "GO!";
        raceStart = performance.now();

        setTimeout(() => {
            message.textContent = "";
        }, 500);
    }, 3000);
}

function pressLeg(side) {
    if (state === "menu") {
        startGame();
        return;
    }

    if (state !== "race") return;

    if (side === lastInput) {
        speed *= 0.65;
        return;
    }

    lastInput = side;

    speed += 1.05;

    if (speed > maxSpeed) {
        speed = maxSpeed;
    }

    stride += Math.PI * .75;
    runnerBob = 3;

    setTimeout(() => {
        runnerBob = 0;
    }, 100);
}

leftButton.addEventListener("pointerdown", () => {
    pressLeg("left");
});

rightButton.addEventListener("pointerdown", () => {
    pressLeg("right");
});

function update() {
    if (state === "race") {
        speed *= 0.985;

        distance += speed * 0.018;

        stride += speed * 0.055;

        const elapsed =
            (performance.now() - raceStart) / 1000;

        timerText.textContent = elapsed.toFixed(2);

        distanceText.textContent =
            Math.max(0, 100 - distance).toFixed(1) + "m";

        if (distance >= 100) {
            finishRace(elapsed);
        }
    }

    requestAnimationFrame(update);
}

function finishRace(time) {
    state = "finished";

    finalTime = time;

    speed = 0;

    message.textContent = "FINISH!";

    distanceText.textContent = "100m";

    setTimeout(() => {
        message.textContent = finalTime.toFixed(2) + "s";
    }, 800);
}

update();
