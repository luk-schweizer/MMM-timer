const ModuleDefinition = class {
  constructor() {
    this.hidden = false;
    this.config = this.defaults;
  }
  show() {
    this.hidden = false;
  }
  hide() {
    this.hidden = true;
  }
};

global.Module = {
  register: jest.fn((moduleName, moduleDefinition)=>{
    Object.setPrototypeOf(ModuleDefinition.prototype, moduleDefinition);
    ModuleDefinition.prototype.name = moduleName;
  }),
};

require('../MMM-timer.js');

beforeEach(() => {
  jest.useFakeTimers();
  jest.resetModules(); // Reset cache
});

test('moduleDefinition should have MMM-timer as name attribute', () => {
  const moduleInstance = new ModuleDefinition();

  expect(moduleInstance.name).toBe('MMM-timer');
});

test('moduleDefinition should return 283 as PATH_LENGTH attribute', () => {
  const moduleInstance = new ModuleDefinition();

  expect(moduleInstance.PATH_LENGTH).toBe(283);
});

test('moduleDefinition should show the module when module is hidden and event TIMER_RUNNING is received', () => {
  // When
  const moduleInstance = new ModuleDefinition();

  document.body.appendChild(moduleInstance.getDom());
  moduleInstance.hide();
  const event = 'TIMER_RUNNING';

  // That
  moduleInstance.socketNotificationReceived(event, {
    timeLeftMs: 1000,
    timeLeftFormattedMinutes: '0:01',
    stage: 'start',
    timeLimitMs: 2000,
  });

  // Then
  expect(moduleInstance.hidden).toBe(false);
});

test('moduleDefinition should update view with start payload when event TIMER_RUNNING is received', () => {
  const moduleInstance = new ModuleDefinition();

  document.body.appendChild(moduleInstance.getDom());
  moduleInstance.hide();
  const event = 'TIMER_RUNNING';

  moduleInstance.socketNotificationReceived(event, {
    timeLeftMs: 1000,
    timeLeftFormattedMinutes: '0:01',
    stage: 'start',
    timeLimitMs: 2000,
  });

  expect(document.getElementById('timer-text').innerHTML).toBe('0:01');
  expect(document.getElementById('timer-path-remaining').getAttribute('class')).toBe('timer-path-remaining green');
  expect(document.getElementById('timer-path-remaining').getAttribute('stroke-dasharray')).toBe('141 283');
  expect(document.getElementById('timer-path-elapsed').getAttribute('class')).toBe('timer-path-elapsed green');
});

test('moduleDefinition should update view with end payload when event TIMER_RUNNING is received', () => {
  // When
  const moduleInstance = new ModuleDefinition();

  document.body.appendChild(moduleInstance.getDom());
  const event = 'TIMER_RUNNING';

  // That
  moduleInstance.socketNotificationReceived(event, {
    timeLeftMs: 10,
    timeLeftFormattedMinutes: '0:00',
    stage: 'end',
    timeLimitMs: 2000,
  });

  // Then
  expect(document.getElementById('timer-text').innerHTML).toBe('0:00');
  expect(document.getElementById('timer-path-remaining').getAttribute('class')).toBe('timer-path-remaining red');
  expect(document.getElementById('timer-path-remaining').getAttribute('stroke-dasharray')).toBe('1 283');
  expect(document.getElementById('timer-path-elapsed').getAttribute('class')).toBe('timer-path-elapsed red');
});

test('moduleDefinition should set path to complete when event TIMER_FINISHED is received', () => {
  const moduleInstance = new ModuleDefinition();

  document.body.appendChild(moduleInstance.getDom());
  moduleInstance.hide();
  const event = 'TIMER_FINISHED';

  moduleInstance.socketNotificationReceived(event, {
    timeLeftMs: 0,
    timeLeftFormattedMinutes: '0:00',
    stage: 'end',
    timeLimitMs: 2000,
  });

  expect(document.getElementById('timer-text').innerHTML).toBe('0:00');
  expect(document.getElementById('timer-path-remaining').getAttribute('class')).toBe('timer-path-remaining red');
  expect(document.getElementById('timer-path-remaining').getAttribute('stroke-dasharray')).toBe('283 283');
  expect(document.getElementById('timer-path-elapsed').getAttribute('class')).toBe('timer-path-elapsed red');
});

test('moduleDefinition should hide module after 10s when event TIMER_FINISHED is received', () => {
  const moduleInstance = new ModuleDefinition();

  document.body.appendChild(moduleInstance.getDom());
  const event = 'TIMER_FINISHED';

  moduleInstance.socketNotificationReceived(event, {
    timeLeftMs: 0,
    timeLeftFormattedMinutes: '0:00',
    stage: 'end',
    timeLimitMs: 2000,
  });

  expect(setTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 10000);
  expect(moduleInstance.hidden).toBe(false);
  jest.runAllTimers();
  expect(moduleInstance.hidden).toBe(true);
});
