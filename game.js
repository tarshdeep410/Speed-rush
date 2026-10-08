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
    ctx
