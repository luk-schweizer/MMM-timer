const NodeHelper = require('node_helper');
const bodyParser = require('body-parser');
const Timer = require('./timer');

const TIMER_FINISHED_ID = 'TIMER_FINISHED';
const TIMER_RUNNING_ID = 'TIMER_RUNNING';

module.exports = NodeHelper.create({

  timer: new Timer(),
  updateInterval: null,

  payload: function() {
    return {
      timeLeftMs: this.timer.timeLeftMs(),
      timeLeftFormattedMinutes: this.timer.timeLeftFormatted(),
      stage: this.timer.stage(),
      timeLimitMs: this.timer.timeLimitMs,
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
    this.timer.reset();
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
    if (!req.body.timeLimitMs) {
      res.status(400).send('timeLimitMs is undefined');
      return;
    }
    if (!this.timer.finished()) {
      res.status(200).send('A timer is already running');
      return;
    }
    this.startTimer(req.body.timeLimitMs);
    res.status(200).send('Request accepted');
  },

  put: function(req, res) {
    if (!req.body.timeLimitMs) {
      res.status(400).send('timeLimitMs is undefined');
      return;
    }
    if (this.timer.finished()) {
      res.status(200).send('A timer is not running');
      return;
    }
    this.timer.timeLimitMs = req.body.timeLimitMs;
    res.status(200).send('Request accepted');
  },

  delete: function(req, res) {
    if (this.timer.finished()) {
      res.status(200).send('A timer is not running');
      return;
    }
    this.stopTimer();
    res.status(200).send('Request accepted');
  },
});
