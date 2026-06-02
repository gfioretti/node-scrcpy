const log = {
  info: (...args: unknown[]) => console.info('[node-scrcpy]', ...args),
  warn: (...args: unknown[]) => console.warn('[node-scrcpy]', ...args),
  error: (...args: unknown[]) => console.error('[node-scrcpy]', ...args),
};

export default log;
