import ManeuverData from "./maneuver.mjs";
import DescriptionMigration from "./migration/old-system-V082/description.mjs";
import ItemDescriptionTemplate from "./templates/item-description.mjs";
import KnackTemplate from "./templates/knack-item.mjs";

/**
 * Data model template with information on items that are used to represent custom active effects.
 */
export default class KnackManeuverData extends ManeuverData.mixin(
  ItemDescriptionTemplate,
  KnackTemplate,
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.KnackManeuver",
  ];

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
            
    } );
  }

  /* -------------------------------------------- */
  /*  Migrations                                  */
  /* -------------------------------------------- */

  /** @inheritDoc */
  static migrateData( source ) {
    // sourceTalent
    // minLevel
    // lpCost
    // restrictions
    // requirements
    
    // Migrate description
    DescriptionMigration.migrateData( source );
    
    // will change with the real Knack migration only for purposes of getting the journal log to work
    source.restrictions = [];
    source.requirements = [];
  }
}