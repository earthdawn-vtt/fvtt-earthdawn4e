import ItemDescriptionTemplate from "./templates/item-description.mjs";
import KnackTemplate from "./templates/knack-item.mjs";
import { ItemDataModel } from "../abstract.mjs";

/**
 * Data model template with information on items that are used to represent custom active effects.
 */
export default class KnackKarmaData extends ItemDataModel.mixin(
  KnackTemplate,
  ItemDescriptionTemplate
) {

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

    // Migrate restrictions
    // restrictions and requirements are currently not done
    source.restrictions = [];
    source.requirements = [];

  }
}