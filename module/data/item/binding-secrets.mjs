import ItemDescriptionTemplate from "./templates/item-description.mjs";
import SpellData from "./spell.mjs";

/**
 * Data model template with information on Spell items.
 */
export default class BindingSecretData extends SpellData.mixin(
  ItemDescriptionTemplate
)  {

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
    super.migrateData( source );
    // specific migration functions
  }
}