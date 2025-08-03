# @tenoch_code/tlaloopi

A robust game loop implementation with fixed timestep updates and variable rendering for JavaScript games and animations.

## Features

- Fixed timestep updates with variable rendering
- Configurable FPS limit
- Prevents spiral of death with update limiting
- Smooth FPS calculation
- Clean API with method chaining
- Works in both browser and Node.js environments

## Installation

```bash
npm install @tenoch_code/tlaloopi
```

## Usage

```javascript
const Loop = require('@tenoch_code/tlaloopi');
// or import Loop from '@tenoch_code/tlaloopi';

// Create a new game loop
const gameLoop = Loop({
  maxFPS: 60,      // Maximum frames per second (0 for uncapped)
  timestep: 1000/60 // Duration of each physics update in ms (16.67ms ≈ 60fps)
}, 
// Update function (runs at fixed timestep)
function update(deltaTime) {
  // Update game state here
  // deltaTime is in seconds
},

// Render function (runs as fast as possible or limited by maxFPS)
function render(interpolation) {
  // Render your game here
  // interpolation is a value between 0 and 1 for smooth rendering
});

// Optional frame start callback
function onFrameStart(timestamp, delta) {
  // Called at the start of each frame
},

// Optional frame end callback
function onFrameEnd(fps, updates) {
  // Called at the end of each frame
  // fps: current frames per second
  // updates: number of updates in this frame
});

// Start the game loop
gameLoop.start();

// To stop the loop
gameLoop.stop();

// To clean up resources
gameLoop.destroy();
```

## API

### `Loop(config, update, render, [onFrameStart], [onFrameEnd])`

Creates a new game loop instance.

- `config` (Object): Configuration options
  - `maxFPS` (Number): Maximum frames per second (default: 60, 0 for uncapped)
  - `timestep` (Number): Duration of each physics update in ms (default: 16.67 ≈ 60fps)
  - `limit` (Number): Maximum number of updates per frame (default: 300)
  - `fps` (Number): Initial FPS value (default: 60)

- `update(deltaTime)` (Function): Called for each fixed timestep update
  - `deltaTime` (Number): Time since last update in seconds

- `render(interpolation)` (Function): Called for each frame render
  - `interpolation` (Number): Interpolation factor between updates (0 to 1)

- `onFrameStart(timestamp, delta)` (Function, optional): Called at the start of each frame
  - `timestamp` (Number): Current timestamp in ms
  - `delta` (Number): Time since last frame in ms

- `onFrameEnd(fps, updates)` (Function, optional): Called at the end of each frame
  - `fps` (Number): Current frames per second
  - `updates` (Number): Number of updates in this frame

### Instance Methods

- `start()`: Starts the game loop
- `stop()`: Stops the game loop
- `reset()`: Resets the game loop state
- `destroy()`: Cleans up resources
- `panic()`: Handles panic condition (too many updates)
- `begin(timestamp, delta)`: Called at the start of each frame
- `end(fps, updates)`: Called at the end of each frame

## License

ISC
