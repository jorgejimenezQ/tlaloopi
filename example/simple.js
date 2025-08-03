// Get the Loop constructor from the global Tlaloopi variable
const Loop = window.Tlaloopi;

// Simple example showing a counter with fixed timestep updates
// and smooth rendering

// Game state
let counter = 0;
let displayCounter = 0;

// Create canvas and context for rendering
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Set canvas size
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Create game loop
const gameLoop = Loop({
    maxFPS: 60,
    timestep: 1000/60
}, 
// Update function (runs at fixed timestep)
function update(deltaTime) {
    // Update game state here
    counter += 1;
    
    // For demonstration, move a square across the screen
    this.x = (this.x || 0) + 100 * deltaTime;
    if (this.x > canvas.width) this.x = -50;
    
    // Update display counter with interpolation
    displayCounter = counter;
},

// Render function (runs as fast as possible or limited by maxFPS)
function render(interpolation) {
    // Clear the canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw counter
    ctx.fillStyle = '#333';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Counter: ${displayCounter}`, canvas.width / 2, 50);
    
    // Draw FPS
    ctx.font = '16px Arial';
    ctx.fillText(`FPS: ${Math.round(this.fps)}`, canvas.width / 2, 80);
    
    // Draw moving square
    const x = this.x || 0;
    const nextX = x + 100 * (this.config.timestep / 1000);
    const renderX = x + (nextX - x) * interpolation;
    
    ctx.fillStyle = '#4285f4';
    ctx.fillRect(renderX, canvas.height / 2 - 25, 50, 50);
}
);

// Start the game loop
gameLoop.start();

// Add some instructions
const instructions = document.createElement('div');
instructions.style.position = 'fixed';
instructions.style.bottom = '20px';
instructions.style.left = '0';
instructions.style.right = '0';
instructions.style.textAlign = 'center';
instructions.style.fontFamily = 'Arial';
instructions.innerHTML = 'Game loop is running. Open console to see update logs.';
document.body.appendChild(instructions);

// Add button to stop/start the loop
const button = document.createElement('button');
button.textContent = 'Pause';
button.style.padding = '10px 20px';
button.style.marginTop = '10px';
button.addEventListener('click', () => {
    if (gameLoop.running) {
        gameLoop.stop();
        button.textContent = 'Resume';
    } else {
        gameLoop.start();
        button.textContent = 'Pause';
    }
});
instructions.appendChild(document.createElement('br'));
instructions.appendChild(button);
