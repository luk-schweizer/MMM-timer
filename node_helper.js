const NodeHelper = require('node_helper');
const bodyParser = require('body-parser');
const Timer = require('./timer');

const TIMER_FINISHED_ID = 'TIMER_FINISHED';
const TIMER_RUNNING_ID = 'TIMER_RUNNING';

module.exports = NodeHelper.create({

  timer: new Timer(),
  updateInterval: null,

  socketNotificationReceived: function(notification, payload) {
    switch (notification) {
      case 'START_TIMER':
        this.startTimer(payload.timeLimitMs);
        break;
      case 'UPDATE_TIMER':
        this.timer.update(payload.timeLimitMs);
        break;
      case 'ADD_TIMER':
        this.timer.add(payload.timeMs);
        break;
      case 'STOP_TIMER':
        this.stopTimer();
        break;
    }
  },

  payload: function() {
    return {
      timeLeftMs: this.timer.timeLeftMs(),
      timeLeftFormattedMinutes: this.timer.timeLeftFormatted(),
      stage: this.timer.stage(),
      timeLimitMs: this.timer.limitMs(),
    };
  },

  startTimer: function(timerLimitMs) {
    this.timer.start(timerLimitMs);
    const self = this;
    this.updateInterval = setInterval(() => {
      if (self.timer.finished()) {
        clearInterval(self.updateInterval);
        self.sendSocketNotification(TIMER_FINISHED_ID, self.payload());
      } else {
        self.sendSocketNotification(TIMER_RUNNING_ID, self.payload());
      }
    }, 500);
  },

  stopTimer: function() {
    this.timer.stop();
    clearInterval(this.updateInterval);
    this.sendSocketNotification(TIMER_FINISHED_ID, this.payload());
  },

  start: function() {
    this.expressApp.use(bodyParser.json());
    this.expressApp.use(bodyParser.urlencoded({extended: true}));

    this.expressApp.post(`/${this.name}/timer`, this.post.bind(this));
    this.expressApp.put(`/${this.name}/timer`, this.put.bind(this));
    this.expressApp.delete(`/${this.name}/timer`, this.delete.bind(this));
  },

  post: function(req, res) {
    try {
      this.startTimer(req.body.timeLimitMs);
      res.status(200).send('Request processed');
    } catch (e) {
      res.status(e.code).send(e.message);
    }
  },

  put: function(req, res) {
    try {
      this.timer.update(req.body.timeLimitMs);
      res.status(200).send('Request processed');
    } catch (e) {
      res.status(e.code).send(e.message);
    }
  },

  delete: function(req, res) {
    try {
      this.stopTimer();
      res.status(200).send('Request processed');
    } catch (e) {
      res.status(e.code).send(e.message);
    }
  },
});
