const dino = document.getElementById("dino");
const shahed = document.getElementById("shahed");
const scoreDisplay = document.getElementById("score");
const explosion = document.getElementById("explosion");
const speedRange = document.getElementById("speedRange");
const speedValue = document.getElementById("speedValue");

const containerWidth = 800;
const containerHeight = 380;

let dinoPos = { x: 100, y: 160 };
const dinoSpeed = 5.5;

let shahedPos = { x: 700, y: 50 };
let shahedSpeed = parseFloat(speedRange.value);

let keys = {};
let score = 0;
let isGameOver = false;

// Вектор движения от джойстика
let joystickMove = { x: 0, y: 0 };

// Регулировка скорости
speedRange.addEventListener("input", (e) => {
    shahedSpeed = parseFloat(e.target.value);
    speedValue.innerText = shahedSpeed;
});

// Клавиатура (ПК)
document.addEventListener("keydown", (e) => { keys[e.code] = true; });
document.addEventListener("keyup", (e) => { keys[e.code] = false; });

// Логика джойстика в стиле Roblox
const joystickBase = document.getElementById("joystick-base");
const joystickStick = document.getElementById("joystick-stick");

let joystickCenter = { x: 0, y: 0 };
let maxRadius = 35;
let touchId = null;

joystickBase.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    touchId = touch.identifier;
    const rect = joystickBase.getBoundingClientRect();
    joystickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    updateJoystick(touch.clientX, touch.clientY);
});

joystickBase.addEventListener("touchmove", (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
            updateJoystick(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
        }
    }
});

function endJoystick() {
    touchId = null;
    joystickMove = { x: 0, y: 0 };
    joystickStick.style.transform = `translate(0px, 0px)`;
}

joystickBase.addEventListener("touchend", endJoystick);
joystickBase.addEventListener("touchcancel", endJoystick);

function updateJoystick(clientX, clientY) {
    let dx = clientX - joystickCenter.x;
    let dy = clientY - joystickCenter.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > maxRadius) {
        dx = (dx / distance) * maxRadius;
        dy = (dy / distance) * maxRadius;
    }

    joystickStick.style.transform = `translate(${dx}px, ${dy}px)`;

    // Нормализуем значения движения от -1 до 1
    joystickMove.x = dx / maxRadius;
    joystickMove.y = dy / maxRadius;
}

function updateGame() {
    if (isGameOver) return;

    let moveX = 0;
    let moveY = 0;

    // Считаем с клавиатуры
    if (keys["KeyW"] || keys["ArrowUp"]) moveY = -1;
    if (keys["KeyS"] || keys["ArrowDown"]) moveY = 1;
    if (keys["KeyA"] || keys["ArrowLeft"]) moveX = -1;
    if (keys["KeyD"] || keys["ArrowRight"]) moveX = 1;

    // Если используется джойстик — приоритет ему
    if (joystickMove.x !== 0 || joystickMove.y !== 0) {
        moveX = joystickMove.x;
        moveY = joystickMove.y;
    }

    // Двигаем Диму
    dinoPos.x += moveX * dinoSpeed;
    dinoPos.y += moveY * dinoSpeed;

    // Ограничиваем границами экрана
    dinoPos.x = Math.max(0, Math.min(containerWidth - 50, dinoPos.x));
    dinoPos.y = Math.max(0, Math.min(containerHeight - 50, dinoPos.y));

    dino.style.left = dinoPos.x + "px";
    dino.style.top = dinoPos.y + "px";

    // Преследование Шахеда
    let dx = dinoPos.x - shahedPos.x;
    let dy = dinoPos.y - shahedPos.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
        shahedPos.x += (dx / distance) * shahedSpeed;
        shahedPos.y += (dy / distance) * shahedSpeed;
    }

    shahed.style.left = shahedPos.x + "px";
    shahed.style.top = shahedPos.y + "px";

    // Столкновение
    if (distance < 40) {
        isGameOver = true;
        explosion.style.left = dinoPos.x + "px";
        explosion.style.top = dinoPos.y + "px";
        explosion.style.display = "block";
        dino.style.display = "none";

        setTimeout(() => {
            alert("💥 Шахед догнал Диму!\nСчет: " + Math.floor(score));
            location.reload();
        }, 300);
    } else {
        score += 0.1;
        scoreDisplay.innerText = "Счет: " + Math.floor(score);
    }

    requestAnimationFrame(updateGame);
}

requestAnimationFrame(updateGame);