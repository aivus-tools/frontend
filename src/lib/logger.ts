const isProd = process.env.NODE_ENV === 'production';

const logger = {
  log: (...args: unknown[]) => {
    if (!isProd) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (!isProd) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args); // always show errors
  },
  info: (...args: unknown[]) => {
    if (!isProd) console.info(...args);
  },
  debug: (...args: unknown[]) => {
    if (!isProd) console.debug(...args);
  },
};

export default logger;
