#!/usr/bin/env node

import { UnusedLocalizationChecker } from "./localization-checker/_module.mjs";
import { createLocalizationCliConfig } from "./localization-checker/cli-config.mjs";

// Parse command line arguments
const argv = createLocalizationCliConfig();

// Run the unused localization keys checker
const checker = new UnusedLocalizationChecker( {
  modulesDir:   argv.moduleDir,
  templatesDir: argv.templatesDir,
  langDir:      argv.langDir,
  outputFile:   argv.outputFile,
  verbose:      argv.verbose
} );

checker.run()
  .catch( error => {
    console.error( "Error running unused localization checker:", error );
    process.exit( 1 );
  } );
