import yargs from "yargs";
import { hideBin } from "yargs/helpers";

/**
 * Creates a shared yargs configuration for localization checker scripts
 * @returns {object} Parsed command line arguments
 */
export function createLocalizationCliConfig() {
  return yargs( hideBin( process.argv ) )
    .usage( "$0 [args]" )
    .option( "module-dir", {
      alias:       "m",
      type:        "string",
      description: "Directory containing *.mjs files",
      default:     "module"
    } )
    .option( "templates-dir", {
      alias:       "t",
      type:        "string",
      description: "Directory containing *.hbs files",
      default:     "templates"
    } )
    .option( "lang-dir", {
      alias:       "l",
      type:        "string",
      description: "Directory containing language files",
      default:     "lang"
    } )
    .option( "output-file", {
      alias:        "o",
      type:         "string",
      demandOption: false,
      description:  "Path to file where results will be saved",
    } )
    .option( "verbose", {
      alias:       "v",
      type:        "boolean",
      description: "Output verbose information",
      default:     false
    } )
    .help()
    .parse();
}
