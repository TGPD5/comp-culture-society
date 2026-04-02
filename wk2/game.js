// --- Game State ---
let wheels = [0, 0, 0, 0, 0, 0];
let wheelTurns = [0, 0, 0, 0, 0, 0];
let wheelsSnapshot = [0, 0, 0, 0, 0, 0]; // NEW: Saves the state before a bill starts
let targetTotal = 0;
let isJammed = false;
let gameActive = false;
let timeLeft = 60;
let jiggleAmount = 0;

// Start Game Function
function startGame() {
    gameActive = true;
    document.getElementById('intro-screen').classList.add('hidden');
    generateBill();
    startTimer();
    updateUI();
}

window.onload = () => {
    updateUI();
};

function rotateWheel(index) {
    if (isJammed || !gameActive) return;

    if (Math.random() * 100 < 5) {
        triggerJam();
        return;
    }

    wheelTurns[index]++;
    incrementWheel(index);
    updateUI();
}

function incrementWheel(index) {
    if (index > 5) return;
    wheels[index]++;
    if (wheels[index] > 9) {
        wheels[index] = 0;
        // The "Sauteuse" delay
        setTimeout(() => {
            incrementWheel(index + 1);
            updateUI();
        }, 150);
    }
    updateUI();
}

function submitTotal() {
    if (isJammed || !gameActive) return;
    const userValue = wheels.reduce((acc, val, i) => acc + (val * Math.pow(10, i)), 0);

    if (userValue === targetTotal) {
        timeLeft += 7;
        alert(`Correct! 7 seconds added.`);
        generateBill();
    } else {
        alert(`ERRONEOUS! Ledger: ${targetTotal}, Machine: ${userValue}. 5 seconds deducted.`);
        timeLeft -= 5;
    }
    updateUI();
}

function generateBill() {
    // 1. Reset the manual turn counters
    wheelTurns = [0, 0, 0, 0, 0, 0];

    // 2. IMPORTANT: Save the current state of the brass wheels as a "checkpoint"
    wheelsSnapshot = [...wheels];

    // 3. Generate the new tax amount
    let value = Math.floor(Math.random() * 800) + 100;
    targetTotal += value;

    document.getElementById('bill-label').innerText = "TAX BILL \n(Add to total):";
    document.getElementById('bill-value').innerText = `+${value}`;
    updateUI();
}

// --- THE FIXED CLEAR ENTRY FUNCTION ---
function clearCurrentEntry() {
    if (isJammed || !gameActive) return;

    // 1. Revert the brass wheels to the snapshot we took at the start of this bill
    wheels = [...wheelsSnapshot];

    // 2. Reset the individual white memory boxes to zero
    wheelTurns = [0, 0, 0, 0, 0, 0];

    alert("Entry voided. The gears have been reset to the start of this bill.");
    updateUI();
}

function triggerJam() {
    isJammed = true;
    jiggleAmount = 0;
    document.getElementById('jam-overlay').classList.remove('hidden');
    window.addEventListener('mousemove', handleJiggle);
}

function handleJiggle(e) {
    jiggleAmount += Math.abs(e.movementX) + Math.abs(e.movementY);
    if (jiggleAmount > 3000) {
        isJammed = false;
        document.getElementById('jam-overlay').classList.add('hidden');
        window.removeEventListener('mousemove', handleJiggle);
    }
}

function updateUI() {
    for (let i = 0; i < 6; i++) {
        const w = document.getElementById(`w-${i}`);
        if (w) {
            w.querySelector('.main-window').innerText = wheels[i];
            w.querySelector('.complement-window').innerText = 9 - wheels[i];
            w.querySelector('.individual-counter').innerText = wheelTurns[i];
        }
    }

    document.getElementById('time-left').innerText = Math.max(0, timeLeft);
    const opacity = Math.min(1, (60 - timeLeft) / 60);
    const sil = document.getElementById('executioner-silhouette');
    if (sil) sil.style.opacity = opacity;
    if (timeLeft <= 0) endGame();
}

function startTimer() {
    const timerInterval = setInterval(() => {
        if (!gameActive) { clearInterval(timerInterval); return; }
        timeLeft--;
        updateUI();
    }, 1000);
}

function endGame() {
    gameActive = false;
    document.getElementById('death-screen').classList.remove('hidden');
}

function resetMachineManual() {
    location.reload();
}