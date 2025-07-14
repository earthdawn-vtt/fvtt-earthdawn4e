import ImageMigration from "./image.mjs";

export default class PowerMigration {

  static async migrateEarthdawnData( source ) {

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

    // Apply image migration
    ImageMigration.migrateEarthdawnData( source );

    // Note: Data model migration is handled by field-level migrations
    // config[source.type] represents data models, not migration classes

    return source;
  }
}