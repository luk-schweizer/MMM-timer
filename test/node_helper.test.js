const NodeHelper = require('node_helper'); // eslint-disable-line
const bodyParser = require('body-parser');
const Timer = require('../timer'); // eslint-disable-line
const NodeHelperModule = require('../node_helper');

jest.mock('node_helper');
jest.mock('body-parser');
jest.mock('../timer');


const resMock = {
  status: jest.fn(()=>resMock),
  send: jest.fn(()=>resMock),
};

beforeAll(() => {
  bodyParser.json = jest.fn();
  bodyParser.urlencoded = jest.fn();
});

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllTimers();
  jest.clearAllMocks();
  jest.resetModules(); // Reset cache
});

test('nodeHelperModule post should start the timer when timeLimitMs is defined in the request and there is no timer running', () => {
  const req = {body: {timeLimitMs: 2000}};

  NodeHelperModule.post(req, resMock);

  expect(NodeHelperModule.timer.start).toHaveBeenCalledWith(2000);
  expect(resMock.status).toHaveBeenCalledWith(200);
  expect(resMock.send).toHaveBeenCalledWith('Request processed');
});

test('nodeHelperModule post should send TIMER_RUNNING event in intervals of 500ms when timer start', () => {
  // When
  const req = {body: {timeLimitMs: 2000}};
  NodeHelperModule.timer.timeLeftMs = jest.fn(() => 1000);
  NodeHelperModule.timer.timeLeftFormatted = jest.fn(() => '0:01');
  NodeHelperModule.timer.stage = jest.fn(() => 'start');
  NodeHelperModule.timer.limitMs = jest.fn(() => 2000);


  // That
  NodeHelperModule.post(req, resMock);

  // Then
  expect(NodeHelperModule.timer.start).toHaveBeenCalledWith(2000);

  jest.advanceTimersByTime(500);

  expect(setInterval).toHaveBeenCalledTimes(1);
  expect(clearInterval).toHaveBeenCalledTimes(0);
  expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 500);
  expect(NodeHelperModule.sendSocketNotification).toHaveBeenCalledTimes(1);
  expect(NodeHelperModule.sendSocketNotification).toHaveBeenCalledWith(
      'TIMER_RUNNING',
      {'stage': 'start',
        'timeLeftFormattedMinutes': '0:01',
        'timeLeftMs': 1000,
        'timeLimitMs': 2000,
      });
  expect(resMock.status).toHaveBeenCalledWith(200);
  expect(resMock.send).toHaveBeenCalledWith('Request processed');

  jest.advanceTimersByTime(500);

  expect(clearInterval).toHaveBeenCalledTimes(0);
  expect(NodeHelperModule.sendSocketNotification).toHaveBeenCalledTimes(2);
  expect(NodeHelperModule.sendSocketNotification).toHaveBeenCalledWith(
      'TIMER_RUNNING',
      {'stage': 'start',
        'timeLeftFormattedMinutes': '0:01',
        'timeLeftMs': 1000,
        'timeLimitMs': 2000,
      });
});

test('nodeHelperModule post should send TIMER_FINISHED event and clearInterval of events when timer starts and then is not running anymore', () => {
  // When
  const req = {body: {timeLimitMs: 2000}};
  NodeHelperModule.timer.finished = jest.fn(() => true);

  NodeHelperModule.timer.timeLeftMs = jest.fn(() => 0);
  NodeHelperModule.timer.timeLeftFormatted = jest.fn(() => '0:00');
  NodeHelperModule.timer.stage = jest.fn(() => 'end');
  NodeHelperModule.timer.limitMs = jest.fn(() => 2000);

  // That
  NodeHelperModule.post(req, resMock);

  // Then
  expect(NodeHelperModule.timer.start).toHaveBeenCalledWith(2000);

  jest.advanceTimersByTime(500);

  expect(setInterval).toHaveBeenCalledTimes(1);
  expect(clearInterval).toHaveBeenCalledTimes(1);
  expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 500);
  expect(NodeHelperModule.sendSocketNotification).toHaveBeenCalledTimes(1);
  expect(NodeHelperModule.sendSocketNotification).toHaveBeenCalledWith(
      'TIMER_FINISHED',
      {'stage': 'end',
        'timeLeftFormattedMinutes': '0:00',
        'timeLeftMs': 0,
        'timeLimitMs': 2000,
      });
  expect(resMock.status).toHaveBeenCalledWith(200);
  expect(resMock.send).toHaveBeenCalledWith('Request processed');

  jest.advanceTimersByTime(500);

  expect(NodeHelperModule.sendSocketNotification).toHaveBeenCalledTimes(1);
});

test('nodeHelperModule delete should stop timer and send TIMER_FINISHED event and clearInterval of events when timer is running', () => {
  // When
  NodeHelperModule.timer.timeLeftMs = jest.fn(() => 0);
  NodeHelperModule.timer.timeLeftFormatted = jest.fn(() => '0:00');
  NodeHelperModule.timer.stage = jest.fn(() => 'end');
  NodeHelperModule.timer.timeLimitMs = jest.fn(() => 2000);

  // That
  NodeHelperModule.delete({}, resMock);

  // Then
  expect(NodeHelperModule.timer.stop).toHaveBeenCalledTimes(1);
  expect(clearInterval).toHaveBeenCalledTimes(1);
  expect(NodeHelperModule.sendSocketNotification).toHaveBeenCalledTimes(1);
  expect(NodeHelperModule.sendSocketNotification).toHaveBeenCalledWith(
      'TIMER_FINISHED',
      {'stage': 'end',
        'timeLeftFormattedMinutes': '0:00',
        'timeLeftMs': 0,
        'timeLimitMs': 2000,
      });
  expect(resMock.status).toHaveBeenCalledWith(200);
  expect(resMock.send).toHaveBeenCalledWith('Request processed');
});


test('nodeHelperModule put should update timer when timer is running', () => {
  // When
  const req = {body: {timeLimitMs: 4000}};

  // That
  NodeHelperModule.put(req, resMock);

  // Then
  expect(NodeHelperModule.timer.update).toHaveBeenCalledWith(4000);
  expect(resMock.status).toHaveBeenCalledWith(200);
  expect(resMock.send).toHaveBeenCalledWith('Request processed');
});


test('nodeHelperModule should update timer when timer is running and UPDATE_TIMER notification is received', () => {
  // When
  const payload = {timeLimitMs: 4000};

  // That
  NodeHelperModule.socketNotificationReceived('UPDATE_TIMER', payload);

  // Then
  expect(NodeHelperModule.timer.update).toHaveBeenCalledWith(4000);
});

test('nodeHelperModule should stop timer when timer is running and STOP_TIMER notification is received', () => {
  NodeHelperModule.socketNotificationReceived('STOP_TIMER', {});

  expect(NodeHelperModule.timer.stop).toHaveBeenCalledTimes(1);
});

test('nodeHelperModule should start the timer when timeLimitMs is defined in the request and there is no timer running and START_TIMER notification is received', () => {
  const payload = {timeLimitMs: 2000};

  NodeHelperModule.socketNotificationReceived('START_TIMER', payload);

  expect(NodeHelperModule.timer.start).toHaveBeenCalledWith(2000);
});

test('nodeHelperModule should add timer when timer is running and ADD_TIMER notification is received', () => {
  // When
  const payload = {timeMs: 4000};

  // That
  NodeHelperModule.socketNotificationReceived('ADD_TIMER', payload);

  // Then
  expect(NodeHelperModule.timer.add).toHaveBeenCalledWith(4000);
});
