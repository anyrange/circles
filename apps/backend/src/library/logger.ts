import pino from "pino";

const pinoLogger = pino({
  base: undefined,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const logger = {
  api: pinoLogger.child({ module: "api" }),
  worker: pinoLogger.child({ module: "worker" }),
};
