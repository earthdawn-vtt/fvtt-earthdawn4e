export default class KnackMigration {

  static async migrateData( source ) {
  
    // migrate source Talent of the knack
    source.sourceTalent = source.sourceTalentName?.toLowerCase().replace( /\s+/g, "-" ) || "";
    // sourceTalent
    // minLevel
    // lpCost
    // restrictions
    // requirements

    // rollType has to be set to ability by default if an attribute is set
  }
}