class Timer {
  constructor() {
    this._startTime = null;
    this.timeLimitMs = 0;
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
    let timeLeft = this.timeLimitMs - elapsedTime;
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
      * @param {number} limitMs Limit of the timer in ms
      */
  start(limitMs) {
    this._startTime = Date.now();
    this.timeLimitMs = limitMs;
  }

  /**
  * Resets the timer
  */
  reset() {
    this._startTime = null;
    this.timeLimitMs = 0;
  }

  /**
      * Calculates the actual stage/phase of the timer.
      *
      * @return {string} 'start'(more than 20s left), 'middle' (20s left), 'end'(10s left)
      */
  stage() {
    const timeLeft = this.timeLeftMs();
    if (timeLeft > 10000 && timeLeft <= 20000) return 'middle';
    if (timeLeft <= 10000) return 'end';
    return 'start';
  }
}

module.exports = Timer;
