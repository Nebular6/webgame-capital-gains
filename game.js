// Game State
const gameState = {
    money: 1000,
    businesses: [],
    upgrades: {
        efficiency: { level: 0, cost: 200, effect: 0.1 },
        marketing: { level: 0, cost: 300, effect: 0.15 }
    },
    leaderboard: [
        { name: "You", money: 1000 },
        { name: "Player2", money: 850 },
        { name: "Player3", money: 700 }
    ]
};

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const moneyDisplay = document.querySelector('.money-display');
const businessBtns = document.querySelectorAll('.business-btn');
const upgradePanel = document.querySelector('.upgrade-panel');
const upgradeList = document.querySelector('.upgrade-list');
const leaderboardList = document.querySelector('.leaderboard-list');

// Initialize Canvas
function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Business Logic
class Business {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.level = 1;
        this.profit = type === 'retail' ? 2 : 5;
        this.cost = type === 'retail' ? 500 : 1000;
    }

    update() {
        gameState.money += this.profit * this.level;
    }

    draw() {
        const size = 40 + this.level * 5;
        const screenX = this.x + canvas.width / 2;
        const screenY = this.y + canvas.height / 2;
        
        ctx.fillStyle = this.type === 'retail' ? '#3498db' : '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(screenX, screenY - size);
        ctx.lineTo(screenX + size, screenY);
        ctx.lineTo(screenX, screenY + size);
        ctx.lineTo(screenX - size, screenY);
        ctx.closePath();
        ctx.fill();
    }
}

// Game Loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw businesses
    gameState.businesses.forEach(business => {
        business.update();
        business.draw();
    });
    
    // Update UI
    moneyDisplay.textContent = `$${gameState.money.toFixed(2)}`;
    
    requestAnimationFrame(gameLoop);
}

// Event Listeners
businessBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const cost = type === 'retail' ? 500 : 1000;
        
        if (gameState.money >= cost) {
            gameState.money -= cost;
            const business = new Business(
                type,
                Math.random() * 400 - 200,
                Math.random() * 400 - 200
            );
            gameState.businesses.push(business);
            btn.style.display = 'none'; // Hide button after purchase
        }
    });
});

// Initialize Upgrades
function initUpgrades() {
    upgradeList.innerHTML = '';
    for (const [name, upgrade] of Object.entries(gameState.upgrades)) {
        const upgradeItem = document.createElement('div');
        upgradeItem.className = 'upgrade-item';
        upgradeItem.innerHTML = `
            <h4>${name.toUpperCase()}</h4>
            <p>Level: ${upgrade.level}</p>
            <p>Effect: +${upgrade.effect * 100}%</p>
            <button class="buy-upgrade" data-upgrade="${name}">
                Buy ($${upgrade.cost})
            </button>
        `;
        upgradeList.appendChild(upgradeItem);
    }
    
    document.querySelectorAll('.buy-upgrade').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const upgradeName = e.target.dataset.upgrade;
            const upgrade = gameState.upgrades[upgradeName];
            
            if (gameState.money >= upgrade.cost) {
                gameState.money -= upgrade.cost;
                upgrade.level++;
                upgrade.cost = Math.floor(upgrade.cost * 1.5);
                initUpgrades();
            }
        });
    });
}

// Initialize Leaderboard
function initLeaderboard() {
    leaderboardList.innerHTML = '';
    gameState.leaderboard.forEach(player => {
        const li = document.createElement('li');
        li.textContent = `${player.name}: $${player.money}`;
        leaderboardList.appendChild(li);
    });
}

// Drag to Pan
let isDragging = false;
let lastX, lastY;

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

window.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        
        gameState.businesses.forEach(business => {
            business.x += dx;
            business.y += dy;
        });
        
        lastX = e.clientX;
        lastY = e.clientY;
    }
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

// Touch support
canvas.addEventListener('touchstart', (e) => {
    isDragging = true;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
    e.preventDefault();
});

canvas.addEventListener('touchmove', (e) => {
    if (isDragging) {
        const dx = e.touches[0].clientX - lastX;
        const dy = e.touches[0].clientY - lastY;
        
        gameState.businesses.forEach(business => {
            business.x += dx;
            business.y += dy;
        });
        
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
    }
    e.preventDefault();
});

canvas.addEventListener('touchend', () => {
    isDragging = false;
});

// Initialize Game
initCanvas();
initUpgrades();
initLeaderboard();
gameLoop();