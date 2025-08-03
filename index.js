/**
 * @tenoch_code/tlatoopi - A robust game loop implementation with fixed timestep updates and variable rendering.
 * 
 * This module provides a game loop that handles game/simulation updates at a fixed rate 
 * while rendering as fast as possible (or limited by maxFPS).
 */

'use strict';

/**
 * Game Loop Implementation
 * @class
 */
function Loop(config = {}, onUpdate, onRender, onFrameStart, onFrameEnd) {
  if (!(this instanceof Loop)) {
    return new Loop(config, onUpdate, onRender, onFrameStart, onFrameEnd);
  }

  // Merge default config with user config
  this.config = {
    limit: 300,      // Maximum number of updates per frame (prevent spiral of death)
    maxFPS: 60,      // Maximum frames per second (0 for uncapped)
    timestep: 1000 / 60, // Duration of each physics update in ms (16.67ms ≈ 60fps)
    fps: 60,         // Current frames per second
    ...config,
  };

  // Validate callbacks
  if (typeof onUpdate !== 'function' || typeof onRender !== 'function') {
    throw new Error('Loop requires both update and render functions');
  }

  this._update = onUpdate;
  this._draw = onRender;
  this._begin = onFrameStart;
  this._end = onFrameEnd;

  // Initialize state
  this.reset();

  // Create a bound version of mainLoop for better performance
  this._boundMainLoop = this.mainLoop.bind(this);
}

// Prototype methods
const loopProto = {
  // Placeholder methods that can be overridden
  update: function(timestep) {},
  draw: function(interpolation) {},
  begin: function(timestamp, delta) {},
  end: function(fps, updates) {},
  stop: function() {},
  start: function() {},
  mainLoop: function(timestamp) {},

  // Internal state
  running: false,
  started: false,
  frameID: 0,
  delta: 0,
  framesThisSecond: 0,
  lastFpsUpdate: 0,
  lastFrameTimeMs: 0,
  mouseDown: false,

  /**
   * Reset the game loop to its initial state
   */
  reset: function() {
    this.running = false;
    this.started = false;
    this.frameID = 0;
    this.delta = 0;
    this.framesThisSecond = 0;
    this.lastFpsUpdate = 0;
    this.lastFrameTimeMs = 0;
    this.fps = this.config.fps;
    this.mouseDown = false;
    return this;
  },

  /**
   * Handle panic condition (too many updates in one frame)
   */
  panic: function() {
    this.delta = 0;
    if (console && console.warn) {
      console.warn('Game loop entered panic mode. Too many updates per frame.');
    }
    return this;
  },

  /**
   * Begin frame processing
   * @param {number} timestamp - Current timestamp
   * @param {number} delta - Time since last frame in ms
   */
  begin: function(timestamp, delta) {
    this.delta = delta;
    if (this._begin) this._begin(timestamp, delta);
    return this;
  },

  /**
   * End frame processing
   * @param {number} fps - Current frames per second
   * @param {number} [updates=0] - Number of updates in this frame
   */
  end: function(fps, updates = 0) {
    this.fps = fps;
    if (this._end) this._end(fps, updates);
    return this;
  },

  /**
   * Stop the game loop and clean up resources
   * @returns {Loop} Returns the instance for method chaining
   */
  stop: function() {
    if (this.frameID) {
      cancelAnimationFrame(this.frameID);
      this.frameID = null;
    }
    this.running = false;
    this.started = false;
    return this;
  },

  /**
   * Start the game loop
   * @returns {Loop} Returns the instance for method chaining
   */
  start: function() {
    if (!this.started) {
      this.started = true;
      this.running = true;

      // Initial frame setup
      this.frameID = requestAnimationFrame((timestamp) => {
        this.running = true;
        this.lastFrameTimeMs = timestamp;
        this.lastFpsUpdate = timestamp;
        this.framesThisSecond = 0;
        this.frameID = requestAnimationFrame(this._boundMainLoop);
      });
    }
    return this;
  },

  /**
   * Main game loop handler
   * @param {number} timestamp - Current timestamp
   * @private
   */
  mainLoop: function(timestamp) {
    // Throttle the frame rate if maxFPS is set
    if (this.config.maxFPS > 0 &&
        timestamp < this.lastFrameTimeMs + (1000 / this.config.maxFPS)) {
      this.frameID = requestAnimationFrame(this._boundMainLoop);
      return;
    }

    // Calculate time since last frame in milliseconds
    var deltaTime = timestamp - this.lastFrameTimeMs;
    this.delta += deltaTime;
    this.lastFrameTimeMs = timestamp;

    // Begin frame processing
    this.begin(timestamp, this.delta);

    // Update FPS counter every second
    if (timestamp > this.lastFpsUpdate + 1000) {
      // Exponential moving average for smoother FPS display
      this.fps = 0.25 * this.framesThisSecond + 0.75 * this.fps;
      this.lastFpsUpdate = timestamp;
      this.framesThisSecond = 0;
    }
    this.framesThisSecond++;

    // Fixed timestep updates (all times in ms)
    var numUpdateSteps = 0;
    while (this.delta >= this.config.timestep) {
      this._update(this.config.timestep / 1000); // Convert to seconds for update
      this.delta -= this.config.timestep;

      // Prevent infinite loops from too many updates
      if (++numUpdateSteps >= this.config.limit) {
        this.panic();
        break;
      }
    }

    // Render with interpolation (value between 0 and 1)
    var interpolation = this.delta / this.config.timestep;
    this._draw(interpolation);

    // End frame processing with FPS and number of updates
    this.end(this.fps, numUpdateSteps);

    // Schedule next frame
    this.frameID = requestAnimationFrame(this._boundMainLoop);
  },

  /**
   * Clean up and release resources
   */
  destroy: function() {
    this.stop();
    this._update = null;
    this._draw = null;
    this._begin = null;
    this._end = null;
    this._boundMainLoop = null;
    return this;
  }
};

// Assign prototype methods to Loop
Object.assign(Loop.prototype, loopProto);

// UMD (Universal Module Definition) pattern to support both CommonJS and browser globals
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.Tlaloopi = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  // Return the Loop constructor for the browser global
  return Loop;
}));
