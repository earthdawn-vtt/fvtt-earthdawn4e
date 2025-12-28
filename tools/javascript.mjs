import eslint from "gulp-eslint-new";
import gulp from "gulp";
import gulpIf from "gulp-if";
import mergeStream from "merge-stream";
import yargs from "yargs";

/**
 * Parsed arguments passed in through the command line.
 * @type {object}
 */
const parsedArgs = yargs( process.argv ).argv;

/**
 * Paths of javascript files that should be linted.
 * @type {string[]}
 */
const LINTING_PATHS = [ "./earthdawn4e.mjs", "./module/" ];


/**
 * Lint javascript sources and optionally applies fixes.
 * @returns {gulp.stream} The stream for compiling LESS files.
 */
function lintJavascript() {
  const applyFixes = !!parsedArgs.fix;
  const tasks = LINTING_PATHS.map( path => {
    // get all mjs files recursively if path is a directory
    const src = path.endsWith( "/" ) ? `${path}**/*.mjs` : path;
    // get parent directory if it's a file
    const dest = path.endsWith( "/" ) ? path : `${path.split( "/" ).slice( 0, -1 ).join( "/" )}`;
    return gulp
      .src( src )
      .pipe( eslint( {fix: applyFixes} ) )
      .pipe( eslint.format() )
      .pipe( gulpIf( file =>
        file.eslint !== null && file.eslint.fixed,
      gulp.dest( dest )
      ) );
  } );
  return mergeStream( tasks );
}

export const lint = lintJavascript;
