export const isDebug = () => process.env.NODE_ENV == 'development';
console.log("Current env is: ", process.env.NODE_ENV);


export const debug = function () {
  if (isDebug())
    return {
      log: window.console.log.bind(window.console, '%o'),
      error: window.console.error.bind(window.console, '%o'),
      info: window.console.info.bind(window.console, '%o'),
      warn: window.console.warn.bind(window.console, '%o'),
      table: window.console.table.bind(window.console, '%o')
    }

  return {
    log: function () { },
    error: function () { },
    warn: function () { },
    info: function () { },
    table: function () { },
  }
}();