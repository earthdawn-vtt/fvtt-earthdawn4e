import { ItemDataModel } from "../../abstract.mjs";
import ED4E from "../../../config.mjs";
import RollableTemplate from "./rollable.mjs";

/**
 * Data model template with information on Attack items.
 * @property {number} strain        strain
 * @property {string} action        action type
 */
export default class ActionTemplate extends ItemDataModel.mixin(
  RollableTemplate,
) {

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
      action: new foundry.data.fields.StringField( {
        required: true,
        nullable: true,
        blank:    true,
        choices:  ED4E.action,
        initial:  "standard",
        label:    this.labelKey( "Action.action" ),
        hint:     this.hintKey( "Action.action" )
      } ),
      strain: new foundry.data.fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
        label:    this.labelKey( "Action.strain" ),
        hint:     this.hintKey( "Action.strain" )
      } ),
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
