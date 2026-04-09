import RollableTemplate from "./rollable.mjs";
import ItemDataModel from "../../abstract/item-data-model.mjs";
import * as ACTIONS from "../../../config/actions.mjs";

/**
 * Data model template with information on Attack items.
 * @property {number} strain        strain
 * @property {string} action        action type
 */
export default class ActionTemplate extends ItemDataModel.mixin(
  RollableTemplate,
) {

  // region Static Properties

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "ED.Data.Item.Action",
  ];

  // endregion

  // region Schema

  /** @inheritDoc */
  static defineSchema() {
    return this.mergeSchema( super.defineSchema(), {
      action: new foundry.data.fields.StringField( {
        required: true,
        nullable: true,
        blank:    true,
        choices:  ACTIONS.action,
        initial:  "standard",
      } ),
      strain: new foundry.data.fields.NumberField( {
        required: true,
        nullable: false,
        min:      0,
        initial:  0,
        integer:  true,
      } ),
    } );
  }

  // endregion

  // region Rolling

  /** @inheritDoc */
  getRollData() {
    return {
      strain:       this.strain,
      strainAmount: this.strain,
      strainDamage: this.strain,
    };
  }

  // endregion

  // region Migration

  /** @inheritDoc */
  static migrateData( source ) {
    return super.migrateData( source );
    // specific migration functions
  }

  // endregion

}
