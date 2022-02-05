import log4js from "log4js";

log4js.configure({
  appenders: {
    console: { type: "console" },
    errorFile: { type: "file", filename: "error.log" },
    warnFile: { type: "file", filename: "warn.log" },
    loggerConsole: {
      type: "logLevelFilter",
      appender: "console",
      level: "info",
    },
    loggerErrors: {
      type: "logLevelFilter",
      appender: "errorFile",
      level: "error",
    },
    loggerWarnings: {
      type: "logLevelFilter",
      appender: "warnFile",
      level: "warn",
    },
  },
  categories: {
    default: {
      appenders: ["loggerConsole", "loggerErrors", "loggerWarnings"],
      level: "all",
    },
  },
});

const logger = log4js.getLogger();

export default logger;
