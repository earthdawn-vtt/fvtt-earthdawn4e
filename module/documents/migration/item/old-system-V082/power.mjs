import { config } from "../../../../data/item/_module.mjs";

export default class PowerMigration {

  static async migrateData( source ) {

    switch ( source.system?.powerType.slugify( { strict: true } ) ) {
      case "power":
      case "attack": {
        source.type = "power";
        break;
      }
      case "maneuver": {
        source.type = "maneuver";
        break;
      }
      default: {
        throw new Error( `Unknown power type: ${ source.system.powerType }` );
      }
    }

    config[ source.type ].migrateData( source.system );

    return source;
  }
}