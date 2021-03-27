class Timer {
  constructor() {
    this._startTime = null;
    this._timeLimitMs = 0;
  }

  /**
      * Returns the time limit in ms
      *
      * @return {number} The time limit in ms
      */
  limitMs() {
    return this._timeLimitMs;
  }

  /**
    * Format the time left in order to be user friendly
    *
    * @return {string} The formatted time string as MM:SS
    */
  timeLeftFormatted() {
    const timeLeft = this.timeLeftMs();
    const minutes = Math.floor((timeLeft / 1000) / 60);
    let seconds = Math.floor((timeLeft / 1000) % 60);

    if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
  }

  /**
    * Calculates time left on the timer as ms
    *
    * @return {number} The time left in ms
    */
  timeLeftMs() {
    const elapsedTime = Date.now() - this._startTime;
    let timeLeft = this._timeLimitMs - elapsedTime;
    if (timeLeft < 0) timeLeft = 0;
    return timeLeft;
  }
  /**
    * Check if the timer has finished
    *
    * @return {boolean} True if timer finished. False if not.
    */
  finished() {
    return this.timeLeftMs() === 0;
  }

  /**
      * Start the timer with the limit specified
      *
      * @param {number} timeLimitMs Limit of the timer in ms
      */
  start(timeLimitMs) {
    if (!timeLimitMs) {
      throw new ErrorWithCode('timeLimitMs is undefined', 400);
    }

    if (!this.finished()) {
      throw new ErrorWithCode('The timer is already running', 409);
    }

    this._startTime = Date.now();
    this._timeLimitMs = timeLimitMs;
  }

  /**
  * Stops the timer
  */
  stop() {
    if (this.finished()) {
      throw new ErrorWithCode('The timer is not running', 409);
    }
    this._startTime = null;
    this._timeLimitMs = 0;
  }

  /**
  * Updates the time limit of the timer
  *
  * @param {number} timeLimitMs New limit of the timer in ms
  */
  update(timeLimitMs) {
    if (!timeLimitMs) {
      throw new ErrorWithCode('timeLimitMs is undefined', 400);
    }
    if (this.finished()) {
      throw new ErrorWithCode('The timer is not running', 409);
    }
    this._timeLimitMs = timeLimitMs;
  }

  /**
  * Adds time to the time limit of the timer
  *
  * @param {number} timeMs time to add in ms
  */
  add(timeMs) {
    if (!timeMs) {
      throw new ErrorWithCode('timeMs is undefined', 400);
    }
    if (this.finished()) {
      throw new ErrorWithCode('The timer is not running', 409);
    }
    this._timeLimitMs += timeMs;
  }

  /**
      * Calculates the actual stage/phase of the timer.
      *
      * @return {string} 'start'(more than 21s left), 'middle' (21s left), 'end'(11s left)
      */
  stage() {
    const timeLeft = this.timeLeftMs();
    if (timeLeft >= 11000 && timeLeft < 21000) return 'middle';
    if (timeLeft < 11000) return 'end';
    return 'start';
  }
}

class ErrorWithCode extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

module.exports = Timer;
