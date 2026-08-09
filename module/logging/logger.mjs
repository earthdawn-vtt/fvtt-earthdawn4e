import { SYSTEM_ID } from "../constants/constants.mjs";
import { getSetting } from "../helpers/settings.mjs";

/**
 * Singleton logger class for the system.
 */
export class LoggerEd {

  // region Static Properties

  /** @type {LoggerEd} */
  static _instance;

  // endregion

  // region Static Methods

  /**
   * Get the singleton instance of the logger.
   * @param {string} [prefix]  The prefix to use for log messages.
   * @param {boolean} [silent] Whether to suppress log messages.
   * @returns {LoggerEd}       The logger instance.
   */
  static getInstance( prefix = SYSTEM_ID, silent = false ) {
    if ( !LoggerEd._instance )
      LoggerEd._instance = new LoggerEd( prefix, silent );
    return LoggerEd._instance;
  }

  // endregion

  // region Properties

  /**
   * The prefix to use for the log messages.
   * @type {string}
   */
  _prefix;

  /**
   * Whether to suppress all log messages.
   * @type {boolean}
   */
  _silent;

  _testCounter = 0;

  // endregion

  /**
   * @param {string} prefix  The prefix to use for log messages.
   * @param {boolean} silent Whether to suppress log messages.
   */
  constructor( prefix, silent ) {
    if ( LoggerEd._instance )
      throw new Error( "LoggerEd is a singleton class" );
    this._prefix = prefix;
    this._silent = silent;
  }

  // region Methods

  /**
   * Format a log message with prefix, timestamp, and level.
   * @param {string} message  The message to format.
   * @param {string} level    The log level (e.g. "INFO", "ERROR").
   * @returns {string}        The formatted message.
   */
  formatMessage( message, level ) {
    const now = new Date().toISOString().slice( 0, 19 );
    return `[${this._prefix}] | ${now} ${level.toUpperCase()}:\n${message}`;
  }

  /**
   * Internal logging method.
   * @param {string} level    The log level.
   * @param {string} message  The message to log.
   * @param {...*} args       Additional arguments to the used {@link console} method.
   * @protected
   */
  _log( level, message, ...args ) {
    let notDebugging = false;
    try {
      notDebugging = getSetting( "debugMode" ) !== true;
    } catch ( e ) {
      console.debug( this.formatMessage( "No settings available yet.", level ), e );
    }
    if ( this._silent || ( level.toUpperCase() === "DEBUG" && notDebugging ) ) return;

    let consoleMethod = console.log;

    if ( level.toUpperCase() === "ERROR" )
      consoleMethod = console.error;
    else if ( level.toUpperCase() === "WARN" )
      consoleMethod = console.warn;
    else if ( level.toUpperCase() === "LOG" )
      consoleMethod = console.log;
    else if ( level.toUpperCase() === "DEBUG" )
      consoleMethod = console.debug;
    else if ( level.toUpperCase() === "INFO" )
      consoleMethod = console.info;

    const fullMsg = this.formatMessage( message, level );
    consoleMethod( fullMsg, ...args );
  }

  /**
   * Log a debug message.
   * @param {string} message  The message to log.
   * @param {...*} args       Additional arguments to the used {@link console} method.
   */
  debug( message, ...args ) {
    this._log( "debug", message, ...args );
  }

  /**
   * Log an info message.
   * @param {string} message  The message to log.
   * @param {...*} args       Additional arguments to the used {@link console} method.
   */
  info( message, ...args ) {
    this._log( "info", message, ...args );
  }

  /**
   * Log a general log message.
   * @param {string} message  The message to log.
   * @param {...*} args       Additional arguments to the used {@link console} method.
   */
  log( message, ...args ) {
    this._log( "log", message, ...args );
  }

  /**
   * Log a warning message.
   * @param {string} message  The message to log.
   * @param {...*} args       Additional arguments to the used {@link console} method.
   */
  warn( message, ...args ) {
    this._log( "warn", message, ...args );
  }

  /**
   * Log an error message.
   * @param {string} message  The message to log.
   * @param {...*} args       Additional arguments to the used {@link console} method.
   */
  error( message, ...args ) {
    this._log( "error", message, ...args );
  }

  // endregion
}