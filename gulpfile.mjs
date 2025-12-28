import gulp from "gulp";

import * as css from "./tools/css.mjs";
import * as javascript from "./tools/javascript.mjs";


// default export - build CSS and watch for updates
export default gulp.series(
  gulp.parallel( css.compile ),
  css.watchUpdates
);

// CSS compiling
export const buildCSS = gulp.series( css.compile );

// javascript linting
export const lint = gulp.series( javascript.lint );

// build all artifacts
export const buildAll = gulp.parallel(
  css.compile
);