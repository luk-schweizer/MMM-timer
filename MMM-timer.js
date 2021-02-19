Module.register('MMM-timer', {
  defaults: {
    timeToHideTimerWhenCompleteMs: 10000,
  },

  COLOR_CODES: {
    start: {
      color: 'green',
    },
    middle: {
      color: 'orange',
    },
    end: {
      color: 'red',
    },
  },

  PATH_LENGTH: 283,
  hideTimeout: null,

  updateView: function(payload) {
    const remainingPathColor = this.COLOR_CODES[payload.stage].color;
    const pathRemaining = document.getElementById('timer-path-remaining');
    pathRemaining.setAttribute('stroke-dasharray', this.getCircleDasharray(payload.timeLeftMs, payload.timeLimitMs));
    pathRemaining.setAttribute('class', `timer-path-remaining ${remainingPathColor}`);
    document.getElementById('timer-path-elapsed').setAttribute('class', `timer-path-elapsed ${remainingPathColor}`);
    document.getElementById('timer-text').innerHTML = payload.timeLeftFormattedMinutes;
  },

  getCircleDasharray: function(timeLeftMs, timeLimitMs) {
    const rawTimeFraction = timeLeftMs / timeLimitMs;
    const timeFraction = rawTimeFraction - (1 / timeLimitMs) *
          (1 - rawTimeFraction);
    return `${(
      timeFraction * this.PATH_LENGTH
    ).toFixed(0)} ${this.PATH_LENGTH}`;
  },

  start: function() {
    this.sendSocketNotification('START', {});
  },

  notificationReceived: function(notification, payload, sender) {
    switch (notification) {
      case 'START_TIMER':
        this.sendSocketNotification('START_TIMER', payload);
        break;
      case 'UPDATE_TIMER':
        this.sendSocketNotification('UPDATE_TIMER', payload);
        break;
      case 'STOP_TIMER':
        this.sendSocketNotification('STOP_TIMER', {});
        break;
      case 'MODULE_DOM_CREATED':
        this.hide();
        break;
    }
  },

  socketNotificationReceived: function(notification, payload) {
    switch (notification) {
      case 'TIMER_RUNNING':
        if (this.hideTimeout) clearTimeout(this.hideTimeout);
        if (this.hidden) this.show();
        this.updateView(payload);
        break;
      case 'TIMER_FINISHED':
        this.updateView(payload);
        document.getElementById('timer-path-remaining')
            .setAttribute('stroke-dasharray', `${this.PATH_LENGTH} ${this.PATH_LENGTH}`);
        const self = this;
        this.hideTimeout = setTimeout(function() {
          self.hide();
        }, this.config.timeToHideTimerWhenCompleteMs);
        break;
    }
  },

  getStyles: function() {
    return [this.file('styles.css')];
  },

  getDom: function() {
    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'timer');

    wrapper.innerHTML = `
      <div class="timer-div">
          <svg class="timer-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <g class="timer-circle">
              <circle id="timer-path-elapsed" class="timer-path-elapsed" cx="50" cy="50" r="45">
              </circle>
              <path
                id="timer-path-remaining"
                stroke-dasharray=""
                class=""
                d="
                  M 50, 50
                  m -45, 0
                  a 45,45 0 1,0 90,0
                  a 45,45 0 1,0 -90,0
                "
              ></path>
            </g>
            <text class="timer-text"
            x="50%" y="50%"
            id="timer-text"
            font-size="30"></text>
          </svg>
      </div>
        `;
    return wrapper;
  },

});
