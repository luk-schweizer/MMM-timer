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

  expect(timer.timeLimitMs).toBe(30);
});


test('reset should set timeLimitMs to 0 when timer is running', () => {
  const timer = new Timer();
  timer.start(30);
  timer.reset();

  expect(timer.timeLimitMs).toBe(0);
});

test('finished should be true when timeLeftMs is 0', () => {
  const timer = new Timer();
  timer.start(10);
  timer.reset();

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
