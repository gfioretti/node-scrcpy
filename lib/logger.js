const log = {
  info: (...args) => console.info('[node-scrcpy]', ...args),
  warn: (...args) => console.warn('[node-scrcpy]', ...args),
  error: (...args) => console.error('[node-scrcpy]', ...args),
};

export default log;