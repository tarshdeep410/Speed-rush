const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const distanceText = document.getElementById("distance");
const timeText = document.getElementById("time");
const bestText = document.getElementById("best");
const cadenceValue = document.getElementById("cadenceValue");
const needle = document.getElementById("needle");
const staminaValue = document.getElementById("staminaValue");
const staminaFill = document.getElementById("staminaFill");
const feedback = document.getElementById("feedback");

const menu = document.getElementById("menu");
const countdown = document.getElementById("countdown");
const raceResult = document.getElementById("raceResult");
const finalTime = document.getElementById("finalTime");
const resultMessage = document.getElementById("resultMessage");

const leftButton = document.getElementById("left");
const rightButton = document.getElementById("right");

const skinChoice = document.getElementById("skinChoice");
const kitChoice = document.getElementById("kitChoice");

let W = 0;
let H = 0;
let dpr = 1;

let state = "menu";
let distance = 0;
let raceTime = 0;
let speed = 0;
let stamina = 100;
let cadence = 50;
let lastLeg = "";
let runnerSkin = skinChoice.value;
let runnerKit = kitChoice.value;

let lastFrame = 0;
let raceStartedAt = 0;
let countdownToken = 0;

let crowdMotion = 0;
let trackMotion = 0;
let runnerMotion = 0;
let cameraShake = 0;
let lastTapTime = 0;
let perfectSteps = 0;
let badSteps = 0;

let bestTime = 0;

try {
  bestTime = Number(localStorage.getItem("speedrushBest")) || 0;
} catch (error) {
  bestTime = 0;
}

bestText.textContent = bestTime ? bestTime.toFixed(2) : "--";

function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);

  canvas.style.width = W + "px";
  canvas.style.height = H + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resize);
resize();

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundedRect(x, y, w, h, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
}

function drawStadium() {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#152c46");
  sky.addColorStop(0.42, "#536c80");
  sky.addColorStop(0.72, "#b0a5a0");
  sky.addColorStop(1, "#253b4b");

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Stadium roof
  ctx.fillStyle = "#111d2b";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(W, 0);
  ctx.lineTo(W, H * 0.19);
  ctx.lineTo(W * 0.82, H * 0.13);
  ctx.lineTo(W * 0.18, H * 0.13);
  ctx.lineTo(0, H * 0.19);
  ctx.closePath();
  ctx.fill();

  // Roof lights
  for (let i = 0; i < 8; i++) {
    const x = (i / 7) * W;
    ctx.fillStyle = "rgba(210,240,255,0.8)";
    ctx.fillRect(x, H * 0.15, Math.max(2, W * 0.004), H * 0.025);

    ctx.fillStyle = "rgba(170,220,255,0.08)";
    ctx.beginPath();
    ctx.moveTo(x - 12, H * 0.17);
    ctx.lineTo(x + 12, H * 0.17);
    ctx.lineTo(x + 70, H * 0.48);
    ctx.lineTo(x - 70, H * 0.48);
    ctx.closePath();
    ctx.fill();
  }

  // Upper stadium seating
  ctx.fillStyle = "#263b50";
  ctx.beginPath();
  ctx.moveTo(0, H * 0.20);
  ctx.lineTo(W, H * 0.20);
  ctx.lineTo(W, H * 0.45);
  ctx.lineTo(0, H * 0.45);
  ctx.closePath();
  ctx.fill();

  // Crowd stands
  const rows = 8;
  const cols = Math.ceil(W / 8);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const wave = Math.sin(col * 0.8 + row * 1.7 + crowdMotion);
      const x = col * 8;
      const y = H * 0.23 + row * H * 0.027;

      const colors = [
        "#d7d9d5",
        "#b5d3dc",
        "#d8a79d",
        "#f1d18b",
        "#638fa7",
        "#bfced4",
        "#e6e9ec",
        "#7d9aaf"
      ];

      ctx.fillStyle = colors[
        Math.abs(Math.floor(col * 7 + row * 11 + wave * 3)) %
        colors.length
      ];

      const size = 2.3 + Math.abs(wave) * 1.2;
      ctx.fillRect(x, y, size, size * 2.4);
    }
  }

  // Rail in front of the crowd
  ctx.fillStyle = "#d5e0e8";
  ctx.fillRect(0, H * 0.442, W, Math.max(2, H * 0.004));

  // Stadium lower wall
  ctx.fillStyle = "#263848";
  ctx.fillRect(0, H * 0.45, W, H * 0.08);

  ctx.fillStyle = "#e4edf2";
  ctx.fillRect(0, H * 0.51, W, Math.max(2, H * 0.004));

  // Advertising boards
  const boardY = H * 0.465;
  for (let i = 0; i < 7; i++) {
    const bw = W / 7;
    const x = i * bw;

    ctx.fillStyle = i % 2 === 0 ? "#102d43" : "#203a4e";
    ctx.fillRect(x + 2, boardY, bw - 4, H * 0.035);

    ctx.fillStyle = i % 2 === 0 ? "#55e7ef" : "#f0f3f5";
    ctx.fillRect(x + 5, boardY + H * 0.009, bw * 0.3, H * 0.004);
  }
}

function drawTrack() {
  const horizon = H * 0.53;
  const bottom = H * 1.04;
  const centre = W * 0.5;

  // Track base
  const trackGradient = ctx.createLinearGradient(0, horizon, 0, bottom);
  trackGradient.addColorStop(0, "#b94e43");
  trackGradient.addColorStop(1, "#632b35");

  ctx.fillStyle = trackGradient;
  ctx.beginPath();
  ctx.moveTo(W * 0.42, horizon);
  ctx.lineTo(W * 0.58, horizon);
  ctx.lineTo(W * 1.08, bottom);
  ctx.lineTo(-W * 0.08, bottom);
  ctx.closePath();
  ctx.fill();

  // Track lane lines converge towards the horizon
  for (let i = -3; i <= 3; i++) {
    const topX = centre + i * W * 0.023;
    const bottomX = centre + i * W * 0.17;

    ctx.strokeStyle = "rgba(255,235,220,0.8)";
    ctx.lineWidth = Math.max(1, W * 0.002);
    ctx.beginPath();
    ctx.moveTo(topX, horizon);
    ctx.lineTo(bottomX, bottom);
    ctx.stroke();
  }

  // Moving track markings create a sense of speed
  const lines = 12;

  for (let i = 0; i < lines; i++) {
    const raw = ((i / lines) + trackMotion) % 1;
    const p = raw * raw;

    const y = horizon + p * (bottom - horizon);
    const halfWidth = W * (0.08 + p * 0.52);
    const lineWidth = 1 + p * 4;

    ctx.strokeStyle = `rgba(255,235,220,${0.12 + p * 0.35})`;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctx.moveTo(centre - halfWidth, y);
    ctx.lineTo(centre + halfWidth, y);
    ctx.stroke();
  }

  // Starting line
  ctx.strokeStyle = "rgba(255,255,255,0.65)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W * 0.36, H * 0.76);
  ctx.lineTo(W * 0.64, H * 0.76);
  ctx.stroke();

  // Distant finish marker
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W * 0.465, horizon + 5);
  ctx.lineTo(W * 0.535, horizon + 5);
  ctx.stroke();
}

function drawLimb(x1, y1, x2, y2, width, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawRunner() {
  const baseX = W * 0.5;
  const baseY = H * 0.80;

  const scale = clamp(H / 760, 0.72, 1.2);
  const strideAmount = state === "race"
    ? Math.sin(runnerMotion) * (8 + speed * 1.3)
    : Math.sin(performance.now() * 0.002) * 3;

  const lean = state === "race" ? -0.13 : -0.04;
  const bob = state === "race" ? Math.abs(Math.sin(runnerMotion)) * 5 : 0;

  ctx.save();
  ctx.translate(baseX, baseY - bob);
  ctx.scale(scale, scale);
  ctx.rotate(lean);

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 8, 43, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  const skin = runnerSkin;
  const kit = runnerKit;
  const darkKit = "#152535";

  const legSwing = strideAmount;
  const armSwing = -strideAmount * 0.8;

  // Back leg
  drawLimb(
    -7, -42,
    -15 + legSwing, -17,
    11, darkKit
  );

  drawLimb(
    -15 + legSwing, -17,
    -27 + legSwing, -5,
    8, skin
  );

  // Back shoe
  drawLimb(
    -27 + legSwing, -5,
    -13 + legSwing, -4,
    5, "#e8f2f5"
  );

  // Front leg
  drawLimb(
    7, -42,
    12 - legSwing, -20,
    12, darkKit
  );

  drawLimb(
    12 - legSwing, -20,
    25 - legSwing, -7,
    8, skin
  );

  // Front shoe
  drawLimb(
    25 - legSwing, -7,
    39 - legSwing, -6,
    5, "#e8f2f5"
  );

  // Body
  ctx.fillStyle = kit;
  ctx.beginPath();
  ctx.moveTo(-13, -91);
  ctx.lineTo(12, -91);
  ctx.lineTo(18, -46);
  ctx.lineTo(-8, -40);
  ctx.lineTo(-18, -63);
  ctx.closePath();
  ctx.fill();

  // Kit details
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.beginPath();
  ctx.moveTo(-4, -88);
  ctx.lineTo(2, -89);
  ctx.lineTo(10, -48);
  ctx.lineTo(3, -47);
  ctx.closePath();
  ctx.fill();

  // Arms in opposing motion
  drawLimb(
    -10, -83,
    -22 + armSwing, -67,
    9, skin
  );

  drawLimb(
    -22 + armSwing, -67,
    -15 + armSwing, -56,
    7, skin
  );

  drawLimb(
    10, -82,
    22 - armSwing, -68,
    9, skin
  );

  drawLimb(
    22 - armSwing, -68,
    15 - armSwing, -57,
    7, skin
  );

  // Neck
  ctx.fillStyle = skin;
  ctx.fillRect(-5, -99, 11, 12);

  // Head
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(1, -111, 13, 16, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = "#201d20";
  ctx.beginPath();
  ctx.ellipse(-1, -119, 13, 8, -0.12, Math.PI, Math.PI * 2);
  ctx.fill();

  // Face detail
  ctx.fillStyle = "#241f22";
  ctx.fillRect(7, -112, 3, 2);

  // Bib
  ctx.fillStyle = "#f5f7fa";
  ctx.fillRect(-7, -82, 16, 12);

  ctx.fillStyle = "#152535";
  ctx.font = "bold 6px Arial";
  ctx.textAlign = "center";
  ctx.fillText("SR", 1, -74);

  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, W, H);

  ctx.save();

  if (state === "race" && cameraShake > 0) {
    ctx.translate(
      (Math.random() - 0.5) * cameraShake,
      (Math.random() - 0.5) * cameraShake
    );
  }

  drawStadium();
  drawTrack();
  drawRunner();

  ctx.restore();
}

function updateMeter() {
  needle.style.left = cadence + "%";
  cadenceValue.textContent = Math.round(cadence);

  staminaValue.textContent = Math.round(stamina) + "%";
  staminaFill.style.width = stamina + "%";

  if (stamina > 55) {
    staminaFill.style.background = "#65f2a2";
  } else if (stamina > 25) {
    staminaFill.style.background = "#ffd447";
  } else {
    staminaFill.style.background = "#ff5367";
  }
}

function resetRace() {
  distance = 0;
  raceTime = 0;
  speed = 0;
  stamina = 100;
  cadence = 50;
  lastLeg = "";
  runnerMotion = 0;
  trackMotion = 0;
  cameraShake = 0;
  lastTapTime = 0;
  perfectSteps = 0;
  badSteps = 0;

  distanceText.textContent = "0m";
  timeText.textContent = "0.00";
  feedback.textContent = "WAIT FOR THE COUNTDOWN";

  updateMeter();
}

function startRace() {
  if (state === "countdown" || state === "race") return;

  countdownToken++;
  const thisCountdown = countdownToken;

  resetRace();

  runnerSkin = skinChoice.value;
  runnerKit = kitChoice.value;

  menu.style.display = "none";
  raceResult.style.display = "none";
  countdown.style.display = "flex";

  state = "countdown";

  const sequence = ["3", "2", "1", "RUN!"];
  let index = 0;

  function showNext() {
    if (thisCountdown !== countdownToken) return;

    if (index >= sequence.length) {
      countdown.style.display = "none";
      state = "race";
      raceStartedAt = performance.now();
      feedback.textContent = "HIT THE GREEN ZONE";
      return;
    }

    countdown.textContent = sequence[index];
    index++;

    setTimeout(showNext, 700);
  }

  showNext();
}

function finishRace() {
  if (state !== "race") return;

  state = "finished";
  distance = 100;
  distanceText.textContent = "100m";

  const result = raceTime;
  finalTime.textContent = result.toFixed(2);

  if (!bestTime || result < bestTime) {
    bestTime = result;
    bestText.textContent = bestTime.toFixed(2);

    try {
      localStorage.setItem("speedrushBest", String(bestTime));
    } catch (error) {
      // The game still works if browser storage is unavailable.
    }

    resultMessage.textContent = "NEW PERSONAL BEST!";
  } else if (perfectSteps >= 10) {
    resultMessage.textContent = "GREAT RHYTHM!";
  } else {
    resultMessage.textContent = "KEEP BUILDING SPEED";
  }

  raceResult.style.display = "flex";
}

function pressLeg(side) {
  if (state === "menu" || state === "finished") {
    startRace();
    return;
  }

  if (state !== "race") return;

  // Repeated taps on the same leg break the rhythm.
  if (side === lastLeg) {
    speed = Math.max(0, speed - 0.55);
    stamina = Math.max(0, stamina - 1.5);
    feedback.textContent = "ALTERNATE YOUR LEGS!";
    feedback.style.color = "#ff6477";
    cameraShake = 4;
    updateMeter();
    return;
  }

  lastLeg = side;

  const distanceFromCentre = Math.abs(cadence - 50);
  const now = performance.now();
  const gap = lastTapTime ? now - lastTapTime : 400;

  lastTapTime = now;

  // The middle green section rewards accurate timing.
  if (distanceFromCentre <= 15) {
    const accuracy = 1 - distanceFromCentre / 15;

    speed += 0.75 + accuracy * 0.48;
    stamina -= 0.35;
    perfectSteps++;

    feedback.textContent = accuracy > 0.72
      ? "PERFECT STEP!"
      : "GOOD TIMING!";

    feedback.style.color = "#83ffb1";
  } else if (distanceFromCentre <= 27) {
    speed += 0.25;
    stamina -= 1.1;
    feedback.textContent = "OKAY — FIND THE CENTRE";
    feedback.style.color = "#ffd447";
  } else {
    speed = Math.max(0, speed - 0.45);
    stamina -= 2.2;
    badSteps++;

    feedback.textContent = cadence < 50
      ? "TOO EARLY!"
      : "TOO LATE!";

    feedback.style.color = "#ff6477";
    cameraShake = 3;
  }

  // Taps that are much too close together also waste energy.
  if (gap < 180) {
    speed = Math.max(0, speed - 0.3);
    stamina -= 0.8;
    feedback.textContent = "DON'T RUSH YOUR STEPS";
    feedback.style.color = "#ffd447";
  }

  // Very slow taps interrupt the sprint rhythm.
  if (gap > 1000) {
    speed = Math.max(0, speed - 0.2);
  }

  stamina = clamp(stamina, 0, 100);
  speed = clamp(speed, 0, stamina <= 0 ? 6.2 : 11.5);

  runnerMotion += side === "left" ? 1.3 : 1.55;
  cameraShake = Math.max(cameraShake, 1.5);

  updateMeter();
}

function update(now) {
  const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.04) : 0;
  lastFrame = now;

  crowdMotion += dt * 0.3;

  if (state === "race") {
    raceTime = (now - raceStartedAt) / 1000;

    // Needle movement becomes livelier as the runner accelerates.
    const needleRate = 1.7 + speed * 0.11;
    cadence = 50 + Math.sin(now / 1000 * needleRate * Math.PI) * 47;

    // Speed fades when the player stops pressing the buttons.
    speed = Math.max(0, speed - dt * (0.24 + (100 - stamina) * 0.0015));

    // Low stamina limits maximum speed.
    const staminaLimit = 5.2 + stamina * 0.063;
    speed = Math.min(speed, staminaLimit);

    // Speed controls forward movement.
    distance += speed * dt * 1.5;
    distance = Math.min(distance, 100);

    trackMotion = (trackMotion + dt * (0.12 + speed * 0.035)) % 1;
    runnerMotion += dt * (3 + speed * 1.2);

    // Sprinting gradually consumes energy.
    stamina = Math.max(0, stamina - dt * (0.45 + speed * 0.09));

    cameraShake = Math.max(0, cameraShake - dt * 10);

    distanceText.textContent = Math.floor(distance) + "m";
    timeText.textContent = raceTime.toFixed(2);

    updateMeter();

    if (distance >= 100) {
      finishRace();
    }
  } else {
    cadence = 50 + Math.sin(now / 1000 * 1.5) * 45;
    cameraShake = 0;
    updateMeter();
  }

  render();
  requestAnimationFrame(update);
}

leftButton.addEventListener("pointerdown", function(event) {
  event.preventDefault();
  pressLeg("left");
});

rightButton.addEventListener("pointerdown", function(event) {
  event.preventDefault();
  pressLeg("right");
});

document.getElementById("startButton").addEventListener("click", startRace);

document.getElementById("retryButton").addEventListener("click", startRace);

document.getElementById("menuButton").addEventListener("click", function() {
  countdownToken++;
  state = "menu";
  raceResult.style.display = "none";
  countdown.style.display = "none";
  menu.style.display = "flex";
});

skinChoice.addEventListener("change", function() {
  runnerSkin = skinChoice.value;
});

kitChoice.addEventListener("change", function() {
  runnerKit = kitChoice.value;
});

window.addEventListener("keydown", function(event) {
  if (event.repeat) return;

  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    event.preventDefault();
    pressLeg("left");
  }

  if (event.code === "ArrowRight" || event.code === "KeyD") {
    event.preventDefault();
    pressLeg("right");
  }

  if (event.code === "Space" && state === "menu") {
    event.preventDefault();
    startRace();
  }
});

updateMeter();
requestAnimationFrame(update);
