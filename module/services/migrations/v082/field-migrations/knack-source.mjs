import BaseMigration from "../../common/base-migration.mjs";

export default class KnackSourceTalentMigration extends BaseMigration {

  static migrateEarthdawnData( source, item, migrationId = "" ) {
    /**
     * if knack is owned. search for embedded item with name === sourceTalentName. 
     * if found look up sourceTalentName.system.edid 
     * add ed id to source.system.sourceTalent
     */

    if ( source.items?.length > 0 ) {
      if ( item.system?.sourceTalentName ) {
        const embeddedItem = source.items.find( i => i.name === item.system.sourceTalentName );
        if ( embeddedItem?.system.edid !== "none" ) {
          source.system.sourceTalent = embeddedItem.system.edid;
        } else {
          console.log( `Knack Source Migration: No ED ID found for ${item.system.sourceTalentName} in ${source.name}` );
        }
      }
    }
  }
}