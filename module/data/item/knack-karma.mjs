import ItemDescriptionTemplate from "./templates/item-description.mjs";
import KnackTemplate from "./templates/knack-item.mjs";

import ItemDataModel from "../abstract/item-data-model.mjs";
import DescriptionMigration from "./migration/old-system-V082/description.mjs";

/**
 * Data model template with information on items that are used to represent custom active effects.
 */
export default class KnackKarmaData extends ItemDataModel.mixin(
  KnackTemplate,
  ItemDescriptionTemplate
) {

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.KnackKarma",
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