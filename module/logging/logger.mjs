import { SYSTEM_ID } from "../constants/constants.mjs";
import { getSetting } from "../helpers/settings.mjs";

export class LoggerEd {

  // region Static Properties

  /** @type {LoggerEd} */
  static _instance;

  // endregion

  // region Static Methods

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

  constructor( prefix, silent ) {
    if ( LoggerEd._instance )
      throw new Error( "LoggerEd is a singleton class" );
    this._prefix = prefix;
    this._silent = silent;
  }

  // region Methods

  formatMessage( message, level ) {
    const now = new Date().toISOString().slice( 0, 19 );
    return `[${this._prefix}] | ${now} ${level.toUpperCase()}:\n${message}`;
  }

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

  debug( message, ...args ) {
    this._log( "debug", message, ...args );
  }

  info( message, ...args ) {
    this._log( "info", message, ...args );
  }

  log( message, ...args ) {
    this._log( "log", message, ...args );
  }

  warn( message, ...args ) {
    this._log( "warn", message, ...args );
  }

  error( message, ...args ) {
    this._log( "error", message, ...args );
  }

  // endregion
}