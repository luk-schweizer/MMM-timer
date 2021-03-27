const Timer = require('../timer.js');

test('start should set stage to start', () => {
  const timer = new Timer();
  timer.start(100000);

  const stage = timer.stage();

  expect(stage).toBe('start');
});

test('start should set timeLimitMs to 30 when parameter is 30', () => {
  const timer = new Timer();
  timer.start(30);

  expect(timer.limitMs()).toBe(30);
});


test('stop should set timeLimitMs to 0 when timer is running', () => {
  const timer = new Timer();
  timer.start(30);
  timer.stop();

  expect(timer.limitMs()).toBe(0);
});

test('finished should be true when timeLeftMs is 0', () => {
  const timer = new Timer();
  timer.start(10);
  timer.stop();

  expect(timer.timeLeftMs()).toBe(0);
  expect(timer.finished()).toBe(true);
});

test('finished should be false when timeLeftMs is greater than 0', () => {
  const timer = new Timer();
  timer.start(10000);

  expect(timer.timeLeftMs()).toBeGreaterThan(0);
  expect(timer.finished()).toBe(false);
});

test('start should set timeLeftMs to 2000 when 8 second passed and timeLimit was 10s', () => {
  Date.now = jest.fn(() => new Date(2021, 1, 1, 20, 10, 0, 0));
  const timer = new Timer();
  timer.start(10000);

  Date.now = jest.fn(() => new Date(2021, 1, 1, 20, 10, 8, 0));
  expect(timer.timeLeftMs()).toBe(2000);
});

test('start should set timeLeftMs to 500 when 1.5 second passed and timeLimit was 2s', () => {
  Date.now = jest.fn(() => new Date(2021, 1, 1, 20, 10, 0, 0));
  const timer = new Timer();
  timer.start(2000);

  Date.now = jest.fn(() => new Date(2021, 1, 1, 20, 10, 1, 500));
  expect(timer.timeLeftMs()).toBe(500);
});


test('start should set timeLeftMs to 0 when 1 second passed and timeLimit was 1s', () => {
  Date.now = jest.fn(() => new Date(2021, 1, 1, 20, 10, 0, 0));
  const timer = new Timer();
  timer.start(1000);

  Date.now = jest.fn(() => new Date(2021, 1, 1, 20, 10, 1, 0));
  expect(timer.timeLeftMs()).toBe(0);
});

test('start should set timeLeftMs to 0 when 2 seconds passed and timeLimit was 1s', () => {
  Date.now = jest.fn(() => new Date(2021, 1, 1, 20, 10, 0, 0));
  const timer = new Timer();
  timer.start(1000);

  Date.now = jest.fn(() => new Date(2021, 1, 1, 20, 10, 2, 0));
  expect(timer.timeLeftMs()).toBe(0);
});


test('start should set stage to middle when 20s is left on the timer', () => {
  Date.now = jest.fn(() => new Date(2021, 1, 1, 20, 10, 0, 0));
  const timer = new Timer();
  timer.start(30000);

  Date.now = jest.fn(() => new Date(2021, 1, 1, 20, 10, 10, 0));
  expect(timer.stage()).toBe('middle');
});

test('start should set stage to end when 10s is left on the timer', () => {
  Date.now = jest.fn(() => new Date(2021, 1, 1, 20, 10, 0, 0));
  const timer = new Timer();
  timer.start(30000);

  Date.now = jest.fn(() => new Date(2021, 1, 1, 20, 10, 20, 0));
  expect(timer.stage()).toBe('end');
});

test('start should set timeLeftFormatted to 00:02 when 8 second passed and timeLimit was 10s', () => {
  Date.now = jest.fn(() => new Date(2021, 1, 1, 20, 10, 0, 0));
  const timer = new Timer();
  timer.start(10000);

  Date.now = jest.fn(() => new Date(2021, 1, 1, 20, 10, 8, 0));
  expect(timer.timeLeftFormatted()).toBe('0:02');
});

test('start should set timeLeftFormatted to 9:59 when 10 minutes and 1 second passed and timeLimit was 20 minutes',
    () => {
      Date.now = jest.fn(() => new Date(2021, 1, 1, 20, 10, 0, 0));
      const timer = new Timer();
      timer.start(1200000);

      Date.now = jest.fn(() => new Date(2021, 1, 1, 20, 20, 1, 0));
      expect(timer.timeLeftFormatted()).toBe('9:59');
    });


test('start should set timeLeftFormatted to 0:00 when 8 second passed and timeLimit was 5s', () => {
  Date.now = jest.fn(() => new Date(2021, 1, 1, 20, 10, 0, 0));
  const timer = new Timer();
  timer.start(5000);

  Date.now = jest.fn(() => new Date(2021, 1, 1, 20, 10, 8, 0));
  expect(timer.timeLeftFormatted()).toBe('0:00');
});

test('start should return error and not start the timer when timeLimitMs is undefined in the request', () => {
  const timer = new Timer();
  try {
    timer.start(null);
  } catch (e) {
    expect(e.message).toBe('timeLimitMs is undefined');
    expect(e.code).toBe(400);
    expect(timer.limitMs()).toBe(0);
  }
});

test('start should return error and not start the timer when a timer is already running', () => {
  const timer = new Timer();
  timer.start(2000);
  try {
    timer.start(3000);
  } catch (e) {
    expect(e.message).toBe('The timer is already running');
    expect(e.code).toBe(409);
    expect(timer.limitMs()).toBe(2000);
  }
});


test('update should return error and not update the timer when timeLimitMs is undefined in the request', () => {
  const timer = new Timer();
  try {
    timer.start(3000);
    timer.update(null);
  } catch (e) {
    expect(e.message).toBe('timeLimitMs is undefined');
    expect(e.code).toBe(400);
    expect(timer.limitMs()).toBe(3000);
  }
});


test('update should return error and not update the timer when a timer is not running', () => {
  const timer = new Timer();
  try {
    timer.update(3000);
  } catch (e) {
    expect(e.message).toBe('The timer is not running');
    expect(e.code).toBe(409);
    expect(timer.limitMs()).toBe(0);
  }
});


test('stop should return error and not stop the timer when a timer is not running', () => {
  const timer = new Timer();
  try {
    timer.stop();
  } catch (e) {
    expect(e.message).toBe('The timer is not running');
    expect(e.code).toBe(409);
    expect(timer.limitMs()).toBe(0);
  }
});


test('add should return error and not update the timer when timeLimitMs is undefined in the request', () => {
  const timer = new Timer();
  try {
    timer.start(3000);
    timer.add(null);
  } catch (e) {
    expect(e.message).toBe('timeMs is undefined');
    expect(e.code).toBe(400);
    expect(timer.limitMs()).toBe(3000);
  }
});


test('add should return error and not update the timer when a timer is not running', () => {
  const timer = new Timer();
  try {
    timer.add(3000);
  } catch (e) {
    expect(e.message).toBe('The timer is not running');
    expect(e.code).toBe(409);
    expect(timer.limitMs()).toBe(0);
  }
});


test('update should set timeLeftMs to 500 when is called with 500 and 0 second passed on a start timer with timeLimit 2s', () => {
  Date.now = jest.fn(() => new Date(2021, 1, 1, 20, 10, 0, 0));
  const timer = new Timer();
  timer.start(2000);
  timer.update(500);

  expect(timer.timeLeftMs()).toBe(500);
});

test('add should set timeLeftMs to 2500 when is called with 500 and 0 second passed on a start timer with timeLimit 2s', () => {
  Date.now = jest.fn(() => new Date(2021, 1, 1, 20, 10, 0, 0));
  const timer = new Timer();
  timer.start(2000);
  timer.add(500);

  expect(timer.timeLeftMs()).toBe(2500);
});

test('add should set timeLeftMs to 1500 when is called with -500 and 0 second passed on a start timer with timeLimit 2s', () => {
  Date.now = jest.fn(() => new Date(2021, 1, 1, 20, 10, 0, 0));
  const timer = new Timer();
  timer.start(2000);
  timer.add(-500);

  expect(timer.timeLeftMs()).toBe(1500);
});
