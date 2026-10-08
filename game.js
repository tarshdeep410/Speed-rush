const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const leftButton = document.getElementById("left");
const rightButton = document.getElementById("right");
const message = document.getElementById("message");
const timerText = document.getElementById("time");
const distanceText = document.getElementById("distance");

let W, H, dpr;
let state = "menu";
let distance = 0;
let speed = 0;
let stamina = 100;
let stride = 0;
let lastInput = "";
let raceStart = 0;
let lastFrame = 0;
let crowdOffset = 0;
let trackOffset = 0;
let cameraShake = 0;
let finishTime = 0;
let bestTime = Number(localStorage.getItem("speedrushBest")) || 0;
let countdownToken = 0;

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

function roundedRect(x, y, w, h, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
}

function drawStadium() {
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.6);
    sky.addColorStop(0, "#10172e");
    sky.addColorStop(1, "#62778c");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#dcecff";
    ctx.globalAlpha = 0.85;

    for (const x of [W * 0.07, W * 0.93]) {
        ctx.fillRect(x, H * 0.09, 5, H * 0.24);

        const glow = ctx.createRadialGradient(
            x, H * 0.1, 2, x, H * 0.1, H * 0.2
        );
        glow.addColorStop(0, "rgba(220,240,255,.24)");
        glow.addColorStop(1, "rgba(220,240,255,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(x - H * 0.2, 0, H * 0.4, H * 0.4);
        ctx.fillStyle = "#dcecff";
    }

    ctx.globalAlpha = 1;

    const top = H * 0.16;
    const bottom = H * 0.48;

    ctx.fillStyle = "#202733";
    ctx.fillRect(0, top, W, bottom - top);

    for (let row = 0; row < 6; row++) {
        const y = top + row * (bottom - top) / 6;

        ctx.fillStyle = row % 2 ? "#303b4a" : "#273241";
        ctx.fillRect(0, y, W, 35);

        for (let x = -20; x < W + 20; x += 24) {
            const px = (x + crowdOffset * (row + 1) * 0.3 + W * 5) % W;
            const py = y + 10;

            ctx.fillStyle = "#d5ad8b";
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = ["#d64d49", "#397db7", "#e5e4df", "#e7bd43"][
                Math.abs(Math.floor(x / 24) + row) % 4
            ];
            ctx.fillRect(px - 4, py + 4, 8, 12);
        }
    }

    ctx.fillStyle = "#171c24";
    ctx.fillRect(0, bottom, W, 18);
}

function drawTrack() {
    const horizon = H * 0.49;

    ctx.fillStyle = "#9b353b";
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(W, horizon);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    for (let i = 0; i <= 8; i++) {
        const bottomX = W * i / 8;

        ctx.strokeStyle = "rgba(255,255,255,.8)";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(W / 2, horizon);
        ctx.lineTo(bottomX, H);
        ctx.stroke();
    }

    for (let i = 0; i < 13; i++) {
        const y = horizon +
            ((i * 85 + trackOffset) % (H - horizon));

        const p = (y - horizon) / (H - horizon);

        ctx.strokeStyle = "rgba(255,255,255,.7)";
        ctx.lineWidth = 1 + p * 3;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
    }

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, horizon, W, 4);
}

function limb(x1, y1, x2, y2, width, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawRunner() {
    const scale = Math.min(W / 390, H / 700) * 1.2;
    const x = W * 0.35;
    const ground = H * 0.75;
    const cycle = stride;
    const legA = Math.sin(cycle);
    const legB = Math.sin(cycle + Math.PI);
    const armA = Math.sin(cycle + Math.PI);
    const armB = Math.sin(cycle);

    const bob = Math.abs(Math.sin(cycle * 2)) * speed * 0.4;

    ctx.save();
    ctx.translate(x, ground);
    ctx.scale(scale, scale);

    ctx.fillStyle = "rgba(0,0,0,.25)";
    ctx.beginPath();
    ctx.ellipse(0, 5, 35, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    const hipY = -44 - bob;
    const kneeY = -22 - bob;

    limb(-4, hipY, -12 + legA * 15, kneeY, 11, "#20252e");
    limb(-12 + legA * 15, kneeY,
        -15 + legA * 29, -3 - Math.max(0, legA) * 12 - bob,
        8, "#171b23");

    limb(4, hipY, 12 + legB * 15, kneeY, 11, "#252b35");
    limb(12 + legB * 15, kneeY,
        15 + legB * 29, -3 - Math.max(0, legB) * 12 - bob,
        8, "#171b23");

    // Running shoes
    limb(-15 + legA * 29, -3 - Math.max(0, legA) * 12 - bob,
        -26 + legA * 29, -2 - Math.max(0, legA) * 12 - bob,
        6, "#f2f2f2");

    limb(15 + legB * 29, -3 - Math.max(0, legB) * 12 - bob,
        26 + legB * 29, -2 - Math.max(0, legB) * 12 - bob,
        6, "#f2f2f2");

    // Torso
    ctx.fillStyle = "#e13f4b";
    ctx.beginPath();
    ctx.moveTo(-10, -82 - bob);
    ctx.lineTo(10, -82 - bob);
    ctx.lineTo(12, -46 - bob);
    ctx.lineTo(-8, -42 - bob);
    ctx.closePath();
    ctx.fill();

    // Arms
    limb(-7, -77 - bob, -16 + armA * 15, -60 - bob,
        9, "#bd805f");
    limb(-16 + armA * 15, -60 - bob,
        -10 + armA * 22, -48 - bob,
        7, "#bd805f");

    limb(7, -77 - bob, 16 + armB * 15, -60 - bob,
        9, "#bd805f");
    limb(16 + armB * 15, -60 - bob,
        10 + armB * 22, -48 - bob,
        7, "#bd805f");

    // Head and hair
    ctx.fillStyle = "#bd805f";
    ctx.beginPath();
    ctx.arc(0, -96 - bob, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#202027";
    ctx.beginPath();
    ctx.arc(-1, -101 - bob, 11, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawHud() {
    roundedRect(12, 72, W - 24, 6, 3, "rgba(255,255,255,.25)");
    roundedRect(12, 72, (W - 24) * stamina / 100, 6, 3, "#62edac");

    ctx.fillStyle = "white";
    ctx.font = "bold 12px Arial";
    ctx.fillText("STAMINA", 14, 65);

    if (bestTime > 0) {
        ctx.textAlign = "center";
        ctx.font = "12px Arial";
        ctx.fillStyle = "rgba(255,255,255,.8)";
        ctx.fillText("PERSONAL BEST  " + bestTime.toFixed(2) + "s", W / 2, 65);
        ctx.textAlign = "left";
    }
}

function render() {
    ctx.save();

    if (cameraShake > 0) {
        ctx.translate(
            (Math.random() - 0.5) * cameraShake,
            (Math.random() - 0.5) * cameraShake
        );
    }

    drawStadium();
    drawTrack();

    if (state !== "menu") {
        drawRunner();
        drawHud();
    }

    ctx.restore();

    requestAnimationFrame(render);
}

function startGame() {
    if (state === "countdown" || state === "race") return;

    countdownToken++;
    const token = countdownToken;

    distance = 0;
    speed = 0;
    stamina = 100;
    stride = 0;
    lastInput = "";
    timerText.textContent = "0.00";
    distanceText.textContent = "100m";
    state = "countdown";
    message.textContent = "3";

    setTimeout(() => {
        if (token === countdownToken && state === "countdown")
            message.textContent = "2";
    }, 1000);

    setTimeout(() => {
        if (token === countdownToken && state === "countdown")
            message.textContent = "1";
    }, 2000);

    setTimeout(() => {
        if (token !== countdownToken || state !== "countdown") return;

        state = "race";
        raceStart = performance.now();
        lastFrame = raceStart;
        message.textContent = "GO!";

        setTimeout(() => {
            if (state === "race") message.textContent = "";
        }, 600);
    }, 3000);
}

function pressLeg(side) {
    if (state === "menu" || state === "finished") {
        startGame();
        return;
    }

    if (state !== "race") return;
    if (side === lastInput) return;

    lastInput = side;

    const rhythm = speed < 2 ? 1.3 : 1;

    speed += 0.8 * rhythm * (stamina / 100 + 0.25);
    speed = Math.min(speed, 7.5);

    stamina = Math.max(0, stamina - 0.3);
    stride += 0.85 + speed * 0.08;
    cameraShake = 1.5;
}

leftButton.addEventListener("pointerdown", event => {
    event.preventDefault();
    pressLeg("left");
});

rightButton.addEventListener("pointerdown", event => {
    event.preventDefault();
    pressLeg("right");
});

function update(now) {
    const dt = lastFrame ? Math.min((now - lastFrame) / 16.67, 2) : 1;
    lastFrame = now;

    if (state === "race") {
        speed *= Math.pow(0.993, dt);
        distance += speed * 0.075 * dt;
        stride += speed * 0.012 * dt;
        stamina = Math.max(0, stamina - speed * 0.001 * dt);

        const elapsed = (now - raceStart) / 1000;
        timerText.textContent = elapsed.toFixed(2);
        distanceText.textContent =
            Math.max(0, 100 - distance).toFixed(1) + "m";

        if (distance >= 100) finishRace(elapsed);
    }

    crowdOffset += speed * dt;
    trackOffset = (trackOffset + speed * 1.5 * dt) % H;
    cameraShake *= 0.9;

    requestAnimationFrame(update);
}

function finishRace(time) {
    state = "finished";
    finishTime = time;
    speed = 0;

    if (!bestTime || time < bestTime) {
        bestTime = time;
        localStorage.setItem("speedrushBest", bestTime);
        message.textContent = "NEW BEST!";
    } else {
        message.textContent = "FINISH!";
    }

    distanceText.textContent = "100m";

    setTimeout(() => {
        if (state === "finished") {
            message.textContent =
                finishTime.toFixed(2) + "s  •  TAP TO RETRY";
        }
    }, 1000);
}

message.textContent = "SPEED//RUSH";
message.addEventListener("click", startGame);

render();
requestAnimationFrame(update);
