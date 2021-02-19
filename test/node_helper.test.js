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

test('nodeHelperModule post should return error and not start the timer when timeLimitMs is undefined in the request', () => {
  const req = {body: {}};

  NodeHelperModule.post(req, resMock);

  expect(NodeHelperModule.timer.start).toHaveBeenCalledTimes(0);
  expect(resMock.status).toHaveBeenCalledWith(400);
  expect(resMock.send).toHaveBeenCalledWith('timeLimitMs is undefined');
});


test('nodeHelperModule post should not start the timer when a timer is already running', () => {
  const req = {body: {timeLimitMs: 2000}};
  NodeHelperModule.timer.finished = jest.fn(() => false);

  NodeHelperModule.post(req, resMock);

  expect(NodeHelperModule.timer.start).toHaveBeenCalledTimes(0);
  expect(resMock.status).toHaveBeenCalledWith(409);
  expect(resMock.send).toHaveBeenCalledWith('A timer is already running');
});


test('nodeHelperModule post should start the timer when timeLimitMs is defined in the request and there is no timer running', () => {
  const req = {body: {timeLimitMs: 2000}};
  NodeHelperModule.timer.finished = jest.fn(() => true);

  NodeHelperModule.post(req, resMock);

  expect(NodeHelperModule.timer.start).toHaveBeenCalledWith(2000);
  expect(resMock.status).toHaveBeenCalledWith(200);
  expect(resMock.send).toHaveBeenCalledWith('Request processed');
});

test('nodeHelperModule post should send TIMER_RUNNING event in intervals of 500ms when timer start', () => {
  // When
  const req = {body: {timeLimitMs: 2000}};
  NodeHelperModule.timer.finished = jest
      .fn()
      .mockImplementationOnce(() => true)
      .mockImplementationOnce(() => false);

  NodeHelperModule.timer.timeLeftMs = jest.fn(() => 1000);
  NodeHelperModule.timer.timeLeftFormatted = jest.fn(() => '0:01');
  NodeHelperModule.timer.stage = jest.fn(() => 'start');
  NodeHelperModule.timer.timeLimitMs = 2000;


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
  NodeHelperModule.timer.timeLimitMs = 2000;

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

test('nodeHelperModule put should return error and not update the timer when timeLimitMs is undefined in the request', () => {
  const req = {body: {}};
  NodeHelperModule.timer.timeLimitMs = 2000;

  NodeHelperModule.put(req, resMock);

  expect(NodeHelperModule.timer.timeLimitMs).toBe(2000);
  expect(resMock.status).toHaveBeenCalledWith(400);
  expect(resMock.send).toHaveBeenCalledWith('timeLimitMs is undefined');
});


test('nodeHelperModule put should not update the timer when a timer is not running', () => {
  const req = {body: {timeLimitMs: 4000}};
  NodeHelperModule.timer.timeLimitMs = 2000;
  NodeHelperModule.timer.finished = jest.fn(() => true);

  NodeHelperModule.put(req, resMock);

  expect(NodeHelperModule.timer.timeLimitMs).toBe(2000);
  expect(resMock.status).toHaveBeenCalledWith(409);
  expect(resMock.send).toHaveBeenCalledWith('A timer is not running');
});


test('nodeHelperModule delete should not stop the timer when a timer is not running', () => {
  NodeHelperModule.timer.finished = jest.fn(() => true);

  NodeHelperModule.delete({}, resMock);

  expect(NodeHelperModule.timer.reset).toHaveBeenCalledTimes(0);
  expect(resMock.status).toHaveBeenCalledWith(409);
  expect(resMock.send).toHaveBeenCalledWith('A timer is not running');
});


test('nodeHelperModule delete should reset timer and send TIMER_FINISHED event and clearInterval of events when timer is running', () => {
  // When
  NodeHelperModule.timer.finished = jest.fn(() => false);

  NodeHelperModule.timer.timeLeftMs = jest.fn(() => 0);
  NodeHelperModule.timer.timeLeftFormatted = jest.fn(() => '0:00');
  NodeHelperModule.timer.stage = jest.fn(() => 'end');
  NodeHelperModule.timer.timeLimitMs = 2000;

  // That
  NodeHelperModule.delete({}, resMock);

  // Then
  expect(NodeHelperModule.timer.reset).toHaveBeenCalledTimes(1);
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


test('nodeHelperModule put should update timeLimitMs when timer is running', () => {
  // When
  NodeHelperModule.timer.finished = jest.fn(() => false);
  NodeHelperModule.timer.timeLimitMs = 2000;
  const req = {body: {timeLimitMs: 4000}};

  // That
  NodeHelperModule.put(req, resMock);

  // Then
  expect(NodeHelperModule.timer.timeLimitMs).toBe(4000);
  expect(resMock.status).toHaveBeenCalledWith(200);
  expect(resMock.send).toHaveBeenCalledWith('Request processed');
});


test('nodeHelperModule should update timeLimitMs when timer is running and UPDATE_TIMER notification is received', () => {
  // When
  NodeHelperModule.timer.finished = jest.fn(() => false);
  NodeHelperModule.timer.timeLimitMs = 2000;
  const payload = {timeLimitMs: 4000};

  // That
  NodeHelperModule.socketNotificationReceived('UPDATE_TIMER', payload);

  // Then
  expect(NodeHelperModule.timer.timeLimitMs).toBe(4000);
});

test('nodeHelperModule should reset timer when timer is running and STOP_TIMER notification is received', () => {
  NodeHelperModule.timer.finished = jest.fn(() => false);

  NodeHelperModule.socketNotificationReceived('STOP_TIMER', {});

  expect(NodeHelperModule.timer.reset).toHaveBeenCalledTimes(1);
});

test('nodeHelperModule should start the timer when timeLimitMs is defined in the request and there is no timer running and START_TIMER notification is received', () => {
  const payload = {timeLimitMs: 2000};
  NodeHelperModule.timer.finished = jest.fn(() => true);

  NodeHelperModule.socketNotificationReceived('START_TIMER', payload);

  expect(NodeHelperModule.timer.start).toHaveBeenCalledWith(2000);
});
